import { col, fn, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import { Op } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";
import { AuthRequest } from "../middleware/authMiddleware";

export const createInventoryProductsWithCombinedNumbers = async (
  binId: number,
  quantity: number,
  siplId: number,
  isSlabType: boolean,
  sellingPrice: number,
  productId: number,
  clientId: number,
  transaction: Transaction,
  status?: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  landedUnitCost?: number,
  receivedDate?: Date | string,
  FOBcost?: number
) => {
  const sipl: any = await models.SIPL.findByPk(siplId, {
    attributes: ["invoiceCode"],
    transaction
  });

  if (!sipl) {
    throw new Error("SIPL not found for the given ID.");
  }

  // Get the last combined number for this SIPL by checking inventory products
  const lastInventoryProduct: any = await getLastInventoryProductAsPerSipl(siplId, transaction)

  const lastCombinedNumber = lastInventoryProduct?.combinedNumber || null;
  let lastSection = 0;

  if (lastCombinedNumber) {
    const parts = lastCombinedNumber.split("-");
    lastSection = parseInt(parts[parts.length - 1] || "0", 10);
  }

  const baseNumber = sipl.invoiceCode.split(" ")[1];
  const inventoryProductsData = Array.from({ length: quantity }, (_, index) => ({
    binId,
    combinedNumber: `${baseNumber}-${lastSection + index + 1}`,
    isSlabType,
    sellingPrice,
    siplId,
    productId,
    clientId,
    ...(status && { status }),
    ...(landedUnitCost !== undefined && landedUnitCost !== null && { landedUnitCost }),
    ...(receivedDate && { receivedDate }),
    ...(FOBcost !== undefined && FOBcost !== null && { FOBcost }),
  }));

  return await scoped(models.InventoryProduct).bulkCreate(inventoryProductsData, { transaction });
};

const getLastInventoryProductAsPerSipl = (siplId: number, transaction?: Transaction) => {
  return scoped(models.InventoryProduct).findOne({
    where: { siplId },
    order: [
      [
        sequelize.literal(
          "CAST(SUBSTRING_INDEX(`combinedNumber`, '-', -1) AS UNSIGNED)"
        ),
        "DESC",
      ],
    ],
    attributes: ["combinedNumber"],
    transaction,
  });
}

export const getNewCombinedNumber = async (siplId: number, transaction?: Transaction) => {
  const sipl: any = await models.SIPL.findByPk(siplId, {
    attributes: ["invoiceCode"],
    transaction
  });

  if (!sipl) {
    throw new Error("SIPL not found for the given ID.");
  }

  // Get the last combined number for this SIPL by checking inventory products
  const lastInventoryProduct: any = await getLastInventoryProductAsPerSipl(siplId, transaction)

  const lastCombinedNumber = lastInventoryProduct?.combinedNumber || null;

  if (!lastCombinedNumber) {
    return `${sipl.invoiceCode.split(" ")[1]}-1`;
  }

  const parts = lastCombinedNumber.split("-");
  const lastSection = parseInt(parts[parts.length - 1] || "0", 10);
  const newCombinedNumber = `${parts.slice(0, -1).join("-")}-${lastSection + 1}`;

  return newCombinedNumber;
};

export const getInventoryProductsBySIPL = async (req: AuthRequest, siplId: number, excludeSoldCanceled = false) => {
  // Find all inventory products where the middle number in combinedNumber matches the SIPL ID
  const where: any = { siplId };
  if (excludeSoldCanceled) {
    where.status = {
      [Op.notIn]: ['SOLD', 'CANCELED']
    };
  }

  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'slab'
      },
      {
        association: 'cartItem',
        where: {
          accountId: req.user?.accountId
        },
        required: false
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'hold'
      },
      {
        association: "bin",
        include: [
          {
            association: "warehouse",
            include: [
              {
                association: "location",
                attributes: ["locationName"],
              },
            ],
          },
        ],
      },
      {
        association: 'images',
        required: false,
        where: { isPrimary: true },
        include: [{ association: "s3File" }]
      },
    ],
  });

  return inventoryProducts;
};

export const getDistinctGroupsByProduct = async (productId: number, locationId: number, groupBy: 'block' | 'lot', excludeSoldCanceled = false) => {
  const groupField = groupBy === 'block' ? 'slab.block' : 'slab.lot';
  const groupAlias = groupBy === 'block' ? 'block' : 'bundle';

  const where: any = {
    productId,
    locationId,
  };

  if (excludeSoldCanceled) {
    where.status = {
      [Op.notIn]: ['SOLD', 'CANCELED']
    };
  }

  return await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'slab',
        attributes: [],
        required: true,
      },
      {
        association: 'hold',
        attributes: [],
        required: false
      },
    ],
    attributes: [
      [col(groupField), groupAlias],
      [fn('COUNT', col('InventoryProduct.id')), 'unitCount'],
      [fn('SUM', sequelize.literal('CASE WHEN `hold`.`id` IS NULL THEN (`slab`.`receivingLength` * `slab`.`receivingWidth` / 144) ELSE 0 END')), 'totalArea']
    ],
    group: [groupField],
    raw: true,
  });
};

export const updateInventoryProductsSellingPrice = async (ids: number[], sellingPrice: number, transaction?: Transaction) => {
  // Update multiple inventory products by IDs with new selling price
  const result = await scoped(models.InventoryProduct).update(
    { sellingPrice },
    {
      where: {
        id: {
          [Op.in]: ids
        }
      },
      transaction
    }
  );

  return result;
};

/**
 * Set landed unit cost for inventory products by siplId and productId
 */
const updateInventoryProductsAssetValue = async (
  siplId: number,
  productId: number,
  landedUnitCost: number,
  transaction?: Transaction
) => {
  const product = await models.Product.findByPk(productId, {
    attributes: ["isSlabType"],
    transaction
  });

  if (product) {
    if ((product as any).isSlabType) {
      const inventoryProducts = await scoped(models.InventoryProduct).findAll({
        where: { siplId, productId },
        include: [{ association: "slab" }],
        transaction
      });

      for (const ip of inventoryProducts) {
        const slab = (ip as any).slab;
        const landedCost = Number((ip as any).landedUnitCost) || 0;
        let assetValue = 0;
        if (slab) {
          const length = Number(slab.packageLength);
          const width = Number(slab.packageWidth);
          if (!length || !width || length <= 0 || width <= 0) {
            throw new Error(`Slab with InventoryProduct ID ${ip.id} is missing packaging dimensions (packageLength/packageWidth).`);
          }
          const area = (length * width) / 144;
          assetValue = area * landedCost;
        } else {
          throw new Error(`InventoryProduct ID ${ip.id} is a slab product but has no associated slab record.`);
        }
        await ip.update({ assetValue }, { transaction });
      }
    } else {
      await scoped(models.InventoryProduct).update(
        { assetValue: landedUnitCost },
        {
          where: { siplId, productId },
          transaction
        }
      );
    }
  }
};

export const setInventoryProductLandedUnitCostAndFOBcost = async (
  siplId: number,
  productId: number,
  landedUnitCost: number,
  FOBcost: number,
  transaction?: Transaction
) => {
  const [updatedCount] = await scoped(models.InventoryProduct).update(
    { landedUnitCost, FOBcost },
    {
      where: { siplId, productId },
      transaction
    }
  );

  await updateInventoryProductsAssetValue(siplId, productId, landedUnitCost, transaction);

  return updatedCount;
};

export const getInventoryProductsBySlabField = async (fieldName: "lot" | "block", fieldValue: string, excludeSoldCanceled = false) => {
  // Find all inventory products where the specified slab field matches
  const where: any = {};
  if (excludeSoldCanceled) {
    where.status = {
      [Op.notIn]: ['SOLD', 'CANCELED']
    };
  }

  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: "bin",
        include: [
          {
            association: "warehouse",
            include: [
              {
                association: "location",
                attributes: ["locationName"],
              },
            ],
          },
        ],
      },
      {
        association: "slab",
        where: { [fieldName]: fieldValue },
        required: true,
      },
      {
        association: 'images',
        required: false,
        where: { isPrimary: true },
        include: [{ association: "s3File" }]
      },
    ],
  });

  return inventoryProducts;
};

export const getAllocatedInventoryProductsAccordingToCustomer = (customerId: number) => {
  const data = scoped(models.InventoryProduct).findAll({
    where: {
      status: INVENTORY_ITEM_STATUS.ALLOCATED
    },
    include: [
      {
        association: 'salesOrderProducts',
        required: true,
        include: [
          {
            association: 'salesOrder',
            required: true,
            where: { customerId }
          }
        ]
      }
    ]
  });

  return data;
}

export const getAllocatedInventoryProductWithSalesOrderAndCustomer = async (inventoryProductId: number) => {
  const whereClause: any = {
    id: inventoryProductId,
    status: INVENTORY_ITEM_STATUS.ALLOCATED,
  };

  const result = await scoped(models.InventoryProduct).findOne({
    where: whereClause,
    include: [
      {
        association: 'salesOrderProducts',
        required: true,
        where: {
          stage: {
            [Op.notIn]: [SALE_ORDER_PRODUCT_STAGES.CLOSED, SALE_ORDER_PRODUCT_STAGES.INVOICED]
          },
        },
        include: [
          {
            association: 'salesOrder',
            required: true,
            include: [
              {
                association: 'customer'
              },
              {
                association: 'createdBy',
                attributes: ['id'],
                include: [
                  {
                    association: 'user',
                  },
                  {
                    association: 'client',
                  },
                ]

              },
            ]
          }
        ]
      }
    ]
  });

  // Convert to plain object to get virtual fields computed
  return result ? result.get({ plain: true }) : null;
}

// Update status of all InventoryProducts for a given SIPL
export const updateInventoryProductStatusBySipl = async (
  siplId: number,
  status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  receivedDate?: Date | string,
  transaction?: Transaction
) => {
  const [updatedCount] = await scoped(models.InventoryProduct).update(
    { status, ...(receivedDate && { receivedDate }) },
    {
      where: { siplId },
      individualHooks: true,
      transaction,
    }
  );

  return updatedCount;
};

// Update status of a single InventoryProduct by its ID
export const updateInventoryProductStatusById = async (
  inventoryProductId: number,
  status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  transaction?: Transaction
) => {
  await scoped(models.InventoryProduct).update(
    { status },
    {
      where: { id: inventoryProductId },
      individualHooks: true,
      transaction,
    }
  );
};

export const getInventoryProducts = (filter: Record<string, string>, locationId?: number) => {

  // const isHold = filter?.isHold === 'true';

  let { isHold, ...restFilter } = filter;

  return scoped(models.InventoryProduct).findAll({
    where: {
      ...restFilter,
      status: {
        [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN,
        ...(restFilter.status ? { [Op.eq]: restFilter.status } : {}),
      },
    },
    include: [
      {
        association: 'hold',
        required: isHold === 'true',
      },
      {
        association: 'slab'
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name']
      },
      {
        association: 'bin',
        attributes: ['id', 'name'],
        include: [
          {
            association: "warehouse",
            attributes: ['id', 'locationId'],
            where: { ...(locationId ? { locationId } : {}) },
            required: true,
            include: [
              {
                association: 'location',
                attributes: ['locationName', 'id'],
              }
            ]

          }
        ]
      }
    ]
  })
}

export const getInventoryProductsPaginated = async (filter: Record<string, any>, locationId?: number, limit: number = 10, offset: number = 0) => {
  let { isHold, ...restFilter } = filter;

  const { count, rows } = await scoped(models.InventoryProduct).findAndCountAll({
    where: {
      ...restFilter,
      status: {
        [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN,
        ...(restFilter.status ? { [Op.eq]: restFilter.status } : {}),
      },
    },
    include: [
      {
        association: 'hold',
        required: isHold === 'true',
      },
      {
        association: 'slab'
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name']
      },
      {
        association: 'bin',
        attributes: ['id', 'name'],
      },
      {
        association: 'salesOrderProducts',
        required: false,
        attributes: ['id'],
        include: [
          {
            association: 'salesOrder',
            where: { status: SALES_ORDER_STATUS.OPEN },
            attributes: ['id', 'clientSoNumber', 'status'],
            required: false
          }
        ]
      }
    ],
    limit,
    offset,
    distinct: true,
    order: [['createdAt', 'DESC']]
  });

  return { total: count, data: rows };
}

export const updateInventoryProductCartStatus = async (id: number, isInCart: boolean) => {
  return await scoped(models.InventoryProduct).update({ isInCart }, { where: { id }, individualHooks: true });
};

export const findInventoryProductById = async (id: number, transaction?: Transaction) => {
  return await models.InventoryProduct.findByPk(id, { attributes: ["id", "status", 'isSlabType', 'clientId'], transaction });
};

// get last landed cost.
export const getLastLandedCost = async (productId: number) => {
  return await scoped(models.InventoryProduct).findOne({
    where: {
      productId
    },
    attributes: ['landedUnitCost'],
    order: [['createdAt', 'desc']]
  })
}

// get average landed cost.
export const getAverageLandedCost = async (productId: number) => {
  const data = await scoped(models.InventoryProduct).findOne({
    where: {
      productId
    },
    attributes: [
      [fn('AVG', col("landedUnitCost")), "avgLandedCost"]
    ]
  })
  return data?.dataValues
}

export const getInventoryProductsWithEmptyBin = async (productId?: number) => {
  return await scoped(models.InventoryProduct).findAll({
    where: {
      binId: null,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      ...(productId ? { productId } : {}),
    },
    include: [
      {
        association: 'slab'
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name']
      }
    ],
    order: [["createdAt", "DESC"]],
  });
};



export const getInventoryProductByQrCode = async (qrCode: string, transaction?: Transaction) => {
  return await scoped(models.InventoryProduct).findOne({
    where: { qrCode },
    include: [
      {
        association: 'location',
        attributes: ['locationName']
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name', 'alternativeName', 'isSlabType']
      },
      {
        association: 'sipl',
        attributes: ['id', 'invoiceCode']
      },
      {
        association: 'bin',
        attributes: ['id', 'name'],
        include: [
          {
            association: 'warehouse',
            attributes: ['id'],
            include: [
              {
                association: 'location',
                attributes: ['id', 'locationName']
              }
            ]
          }
        ]
      },
      {
        association: 'slab'
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'hold',
        include: [
          {
            association: 'customer',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    transaction
  });
};

export const getInStockProductsWithSubCategory = async (clientId: number) => {
  return await scoped(models.InventoryProduct).findAll({
    where: {
      clientId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY
    },
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: [],
        required: false,
        include: [
          {
            model: models.ProductSubCategory,
            as: "subCategory",
            attributes: [],
            required: false
          }
        ]
      }
    ],
    attributes: [
      "isSlabType",
      [sequelize.col("product->subCategory.name"), "categoryName"],
      [sequelize.fn("COUNT", sequelize.col("InventoryProduct.id")), "count"]
    ],
    group: ["InventoryProduct.isSlabType", "product->subCategory.name"],
    raw: true
  });
};

/**
 * Get all QR codes for inventory products in a SIPL
 */
export const getQrCodesBySiplId = async (siplId: number) => {
  return await scoped(models.InventoryProduct).findAll({
    where: {
      siplId
    },
    attributes: ["id", "qrCode", "combinedNumber"],
  });
};

export const updateInventoryProductStatusesByIds = async (
  ids: number[],
  status: string,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProduct).update(
    { status },
    {
      where: { id: { [Op.in]: ids } },
      individualHooks: true,
      transaction
    }
  );
};

export const getInventoryProductImageCount = async (inventoryProductId: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.count({
    where: { inventoryProductId },
    transaction
  });
};

export const createInventoryProductImage = async (inventoryProductId: number, s3FileId: number, isPrimary: boolean, transaction?: Transaction) => {
  return await models.InventoryProductImage.create({
    inventoryProductId,
    s3FileId,
    isPrimary
  }, { transaction });
};

export const findInventoryProductImageById = async (id: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.findByPk(id, { transaction });
};

export const getAnotherInventoryProductImage = async (inventoryProductId: number, excludeImageId: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.findOne({
    where: {
      inventoryProductId,
      id: { [Op.ne]: excludeImageId }
    },
    transaction
  });
};

export const deleteInventoryProductImage = async (id: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.destroy({
    where: { id },
    transaction
  });
};

export const clearInventoryProductPrimaryImages = async (inventoryProductId: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.update(
    { isPrimary: false },
    { where: { inventoryProductId }, transaction }
  );
};

export const setInventoryProductImagePrimary = async (id: number, transaction?: Transaction) => {
  return await models.InventoryProductImage.update(
    { isPrimary: true },
    { where: { id }, transaction }
  );
};

export const getInventoryProductImagesByInventoryProductId = async (inventoryProductId: number) => {
  return await models.InventoryProductImage.findAll({
    where: { inventoryProductId },
    include: [{ association: "s3File" }],
  });
};

import { col, fn, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import { Op } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";
import { AuthRequest } from "../middleware/authMiddleware";
import { decimalSum, decimalDivide } from "../helper/decimal";
import { buildEffectiveSellingPriceWhere, buildSlabWhere } from "./product.repository";

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

export const getInventoryProductsBySIPL = async (req: AuthRequest, siplId: number, excludeSoldCanceled = false, productId?: number) => {
  // Find all inventory products where the middle number in combinedNumber matches the SIPL ID
  const where: any = { siplId };
  const statusConditions: any[] = [];
  if (excludeSoldCanceled) {
    statusConditions.push({ [Op.notIn]: ['SOLD', 'CANCELED'] });
  }

  if (req.query.excludeAllocated === 'true') {
    const includeIds = req.query.includeIds ? String(req.query.includeIds).split(',').map(Number).filter(Boolean) : [];
    
    if (includeIds.length > 0) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({
        [Op.or]: [
          { status: { [Op.ne]: 'ALLOCATED' } },
          { id: { [Op.in]: includeIds } }
        ]
      });
    } else {
      statusConditions.push({ [Op.ne]: 'ALLOCATED' });
    }
  }

  if (statusConditions.length === 1) {
    where.status = statusConditions[0];
  } else if (statusConditions.length > 1) {
    where.status = { [Op.and]: statusConditions };
  }

  if (productId) {
    where.productId = productId;
  }

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(req.query);
  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  const slabWhere = buildSlabWhere(req.query);

  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'product',
        attributes: ['id', 'name', 'singleUnitPrice']
      },
      {
        association: 'slab',
        where: slabWhere || undefined,
        required: !!slabWhere,
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
        association: 'holdItems',
        include: [{ association: 'hold', include: [{ association: 'customer' }] }]
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

export const getDistinctGroupsByProduct = async (productId: number, locationId: number, groupBy: 'block' | 'lot', excludeSoldCanceled = false, filter?: any) => {
  const where: any = {
    productId,
    locationId,
  };

  if (excludeSoldCanceled) {
    where.status = {
      [Op.notIn]: ['SOLD', 'CANCELED']
    };
  }

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(filter);
  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  const slabWhere = buildSlabWhere(filter);
  const combinedSlabWhere = slabWhere ? slabWhere : {};

  const items = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'product',
        attributes: ['singleUnitPrice'],
        required: false,
      },
      {
        association: 'slab',
        attributes: ['block', 'lot', 'receivingLength', 'receivingWidth', 'packageLength', 'packageWidth'],
        where: combinedSlabWhere,
        required: true,
      },
      {
        association: 'bin',
        attributes: ['id', 'name'],
        required: false,
      }
    ],
    attributes: ['id', 'binId', 'sellingPrice']
  });

  const groupAlias = groupBy === 'block' ? 'block' : 'bundle';
  const groupMap: Record<string, { groupValue: string | number; unitCount: number; totalArea: number; locationsSet: Set<string>; sellingPrices: number[] }> = {};

  items.forEach((item: any) => {
    const plain = item.get({ plain: true });
    const groupVal = groupBy === 'block' ? plain.slab?.block : plain.slab?.lot;
    if (groupVal === undefined || groupVal === null) return;

    const key = String(groupVal);
    if (!groupMap[key]) {
      groupMap[key] = {
        groupValue: groupVal,
        unitCount: 0,
        totalArea: 0,
        locationsSet: new Set<string>(),
        sellingPrices: []
      };
    }

    groupMap[key].unitCount += 1;
    const length = Number(plain.slab?.packageLength) || 0;
    const width = Number(plain.slab?.packageWidth) || 0;
    groupMap[key].totalArea += (length * width);

    const price = Number(plain.sellingPrice);
    if (!isNaN(price) && price > 0) {
      groupMap[key].sellingPrices.push(price);
    }

    if (plain.bin?.name) {
      groupMap[key].locationsSet.add(plain.bin.name);
    }
  });

  return Object.values(groupMap).map(g => ({
    [groupAlias]: g.groupValue,
    unitCount: g.unitCount,
    totalArea: g.totalArea,
    locations: Array.from(g.locationsSet).join(', ') || '--',
    avgSellingPrice: g.sellingPrices.length > 0 ? decimalDivide(decimalSum(g.sellingPrices), g.sellingPrices.length) : 0
  }));
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

export const getInventoryProductsBySlabField = async (req: AuthRequest, fieldName: "lot" | "block", fieldValue: string, excludeSoldCanceled = false, productId?: number) => {
  // Find all inventory products where the specified slab field matches
  const where: any = {};
  const statusConditions: any[] = [];
  if (excludeSoldCanceled) {
    statusConditions.push({ [Op.notIn]: ['SOLD', 'CANCELED'] });
  }

  if (req.query.excludeAllocated === 'true') {
    const includeIds = req.query.includeIds ? String(req.query.includeIds).split(',').map(Number).filter(Boolean) : [];
    
    if (includeIds.length > 0) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({
        [Op.or]: [
          { status: { [Op.ne]: 'ALLOCATED' } },
          { id: { [Op.in]: includeIds } }
        ]
      });
    } else {
      statusConditions.push({ [Op.ne]: 'ALLOCATED' });
    }
  }

  if (statusConditions.length === 1) {
    where.status = statusConditions[0];
  } else if (statusConditions.length > 1) {
    where.status = { [Op.and]: statusConditions };
  }

  if (productId) {
    where.productId = productId;
  }

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(req.query);
  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  const slabWhere = buildSlabWhere(req.query);
  const combinedSlabWhere = slabWhere ? { [fieldName]: fieldValue, ...slabWhere } : { [fieldName]: fieldValue };

  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'product',
        attributes: ['id', 'name', 'singleUnitPrice']
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
        association: "slab",
        where: combinedSlabWhere,
        required: true,
      },
      {
        association: 'cartItem',
        where: {
          accountId: req.user?.accountId
        },
        required: false
      },
      {
        association: 'holdItems',
        include: [{ association: 'hold', include: [{ association: 'customer' }] }]
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

export const getInventoryProductsByBinId = async (req: AuthRequest, binId: number, excludeSoldCanceled = false, productId?: number) => {
  const where: any = { binId };
  const statusConditions: any[] = [];
  if (excludeSoldCanceled) {
    statusConditions.push({ [Op.notIn]: ['SOLD', 'CANCELED'] });
  }

  if (req.query.excludeAllocated === 'true') {
    const includeIds = req.query.includeIds ? String(req.query.includeIds).split(',').map(Number).filter(Boolean) : [];
    
    if (includeIds.length > 0) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({
        [Op.or]: [
          { status: { [Op.ne]: 'ALLOCATED' } },
          { id: { [Op.in]: includeIds } }
        ]
      });
    } else {
      statusConditions.push({ [Op.ne]: 'ALLOCATED' });
    }
  }

  if (statusConditions.length === 1) {
    where.status = statusConditions[0];
  } else if (statusConditions.length > 1) {
    where.status = { [Op.and]: statusConditions };
  }

  if (productId) {
    where.productId = productId;
  }

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(req.query);
  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  const slabWhereBin = buildSlabWhere(req.query);

  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'product',
        attributes: ['id', 'name', 'singleUnitPrice']
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
        association: "slab",
        where: slabWhereBin || undefined,
        required: !!slabWhereBin,
      },
      {
        association: 'cartItem',
        where: {
          accountId: req.user?.accountId
        },
        required: false
      },
      {
        association: 'holdItems',
        include: [{ association: 'hold', include: [{ association: 'customer' }] }]
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
  let {
    isHold,
    minSellingPrice, maxSellingPrice,
    minPackagingWidth, maxPackagingWidth,
    minPackagingLength, maxPackagingLength,
    ...restFilter
  } = filter;

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(filter);
  const slabWhere = buildSlabWhere(filter);

  const where: any = {
    ...restFilter,
    status: {
      [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN,
      ...(restFilter.status ? { [Op.eq]: restFilter.status } : {}),
    },
  };

  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  return scoped(models.InventoryProduct).findAll({
    where,
    include: [
      {
        association: 'holdItems',
        required: isHold === 'true',
        include: [{ association: 'hold', include: [{ association: 'customer' }] }]
      },
      {
        association: 'slab',
        where: slabWhere || undefined,
        required: !!slabWhere,
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name', 'singleUnitPrice']
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
  let {
    isHold,
    minSellingPrice, maxSellingPrice,
    minPackagingWidth, maxPackagingWidth,
    minPackagingLength, maxPackagingLength,
    ...restFilter
  } = filter;

  const effectiveSellingPriceWhere = buildEffectiveSellingPriceWhere(filter);
  const slabWhere = buildSlabWhere(filter);

  const where: any = {
    ...restFilter,
    status: {
      [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN,
      ...(restFilter.status ? { [Op.eq]: restFilter.status } : {}),
    },
  };

  if (effectiveSellingPriceWhere) {
    Object.assign(where, effectiveSellingPriceWhere);
  }

  const { count, rows } = await scoped(models.InventoryProduct).findAndCountAll({
    where,
    include: [
      {
        association: 'holdItems',
        required: isHold === 'true',
        include: [{ association: 'hold', include: [{ association: 'customer' }] }]
      },
      {
        association: 'slab',
        where: slabWhere || undefined,
        required: !!slabWhere,
      },
      {
        association: 'genericProduct'
      },
      {
        association: 'product',
        attributes: ['id', 'name', 'singleUnitPrice']
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
  return await models.InventoryProduct.findByPk(id, { attributes: ["id", "status", 'isSlabType', 'clientId', 'combinedNumber'], transaction });
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
        association: 'holdItems',
        include: [
          {
            association: 'hold',
            include: [
              {
                association: 'customer'
              }
            ]
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
    include: [
      {
        association: 'product',
        attributes: ['name']
      }
    ]
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

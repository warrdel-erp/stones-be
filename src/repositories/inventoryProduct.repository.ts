import { col, fn, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import { Op } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

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
  landedUnitCost?: number
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

export const getInventoryProductsBySIPL = async (siplId: number) => {
  // Find all inventory products where the middle number in combinedNumber matches the SIPL ID
  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
    where: {
      siplId
    },
    include: [
      {
        association: 'slab'
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
    ],
  });

  return inventoryProducts;
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
export const setInventoryProductLandedUnitCost = async (
  siplId: number,
  productId: number,
  landedUnitCost: number,
  transaction?: Transaction
) => {
  const [updatedCount] = await scoped(models.InventoryProduct).update(
    { landedUnitCost },
    {
      where: { siplId, productId },
      transaction
    }
  );

  return updatedCount;
};

export const getInventoryProductsBySlabField = async (fieldName: "lot" | "block", fieldValue: string) => {
  // Find all inventory products where the specified slab field matches
  const inventoryProducts = await scoped(models.InventoryProduct).findAll({
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
  transaction?: Transaction
) => {
  const [updatedCount] = await scoped(models.InventoryProduct).update(
    { status },
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
        required: !!Boolean(isHold),
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




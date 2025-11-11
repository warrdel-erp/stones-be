import { col, fn, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import { Op } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";

export const createInventoryProductsWithCombinedNumbers = async (
  binId: number,
  quantity: number,
  siplId: number,
  isSlabType: boolean,
  sellingPrice: number,
  productId: number,
  clientId: number,
  transaction: Transaction
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
    clientId
  }));

  return await models.InventoryProduct.bulkCreate(inventoryProductsData, { transaction });
};

const getLastInventoryProductAsPerSipl = (siplId: number, transaction?: Transaction) => {
  return models.InventoryProduct.findOne({
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
  const inventoryProducts = await models.InventoryProduct.findAll({
    where: {
      siplId
    },
    include: [
      {
        association: "bin",
        include: [
          {
            association: "warehouse",
            include: [
              {
                association: "location",
                attributes: ["location"],
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
  const result = await models.InventoryProduct.update(
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
  const [updatedCount] = await models.InventoryProduct.update(
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
  const inventoryProducts = await models.InventoryProduct.findAll({
    include: [
      {
        association: "bin",
        include: [
          {
            association: "warehouse",
            include: [
              {
                association: "location",
                attributes: ["location"],
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
  const data = models.InventoryProduct.findAll({
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

// Update status of all InventoryProducts for a given SIPL
export const updateInventoryProductStatusBySipl = async (
  siplId: number,
  status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  transaction?: Transaction
) => {
  const [updatedCount] = await models.InventoryProduct.update(
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
  await models.InventoryProduct.update(
    { status },
    {
      where: { id: inventoryProductId },
      individualHooks: true,
      transaction,
    }
  );
};

export const getInventoryProducts = (filter: Record<string, string>, locationId?: number) => {
  return models.InventoryProduct.findAll({
    where: filter,
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
                attributes: ['location', 'id'],
              }
            ]

          }
        ]
      }
    ]
  })
}

export const updateInventoryProductCartStatus = async (id: number, isInCart: boolean) => {
  return await models.InventoryProduct.update({ isInCart }, { where: { id }, individualHooks: true });
};

export const getCartCount = async (clientId: number) => {

  return await models.InventoryProduct.count({
    where: {
      isInCart: true,
      clientId: clientId
    }
  });
};

export const findInventoryProductById = async (id: number) => {
  return await models.InventoryProduct.findByPk(id, { attributes: ["id", "isHold", "status", 'isSlabType', 'clientId'] });
};


// update hold status of slab
export const updateInventoryProductHoldStatus = async (id: number, isHold: boolean) => {

  // Update hold on inventory product instead of slab
  return await models.InventoryProduct.update(
    { isHold },
    { where: { id: id }, individualHooks: true }
  );
};

// get last landed cost.
export const getLastLandedCost = async (productId: number) => {
  return await models.InventoryProduct.findOne({
    where: {
      productId
    },
    attributes: ['landedUnitCost'],
    order: [['createdAt', 'desc']]
  })
}

// get average landed cost.
export const getAverageLandedCost = async (productId: number) => {
  const data = await models.InventoryProduct.findOne({
    where: {
      productId
    },
    attributes: [
      [fn('AVG', col("landedUnitCost")), "avgLandedCost"]
    ]
  })
  return data?.dataValues
}



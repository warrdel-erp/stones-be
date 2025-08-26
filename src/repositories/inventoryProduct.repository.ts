import { Transaction } from "sequelize";
import * as models from "../models";
import { Op } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";

export const createInventoryProducts = async (binId: number, quantity: number, transaction: Transaction) => {
  const inventoryProductsData = Array.from({ length: quantity }, () => ({
    binId,
  }));

  return await models.InventoryProduct.bulkCreate(inventoryProductsData, { transaction });
};

export const createInventoryProductsWithCombinedNumbers = async (
  binId: number,
  quantity: number,
  siplId: number,
  isSlabType: boolean,
  sellingPrice: number,
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
  const lastInventoryProduct: any = await models.InventoryProduct.findOne({
    where: { siplId },
    order: [["combinedNumber", "DESC"]],
    attributes: ["combinedNumber"],
    transaction,
  });

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
    siplId
  }));

  return await models.InventoryProduct.bulkCreate(inventoryProductsData, { transaction });
};

export const getNewCombinedNumber = async (siplId: number, transaction?: Transaction) => {
  const sipl: any = await models.SIPL.findByPk(siplId, {
    attributes: ["invoiceCode"],
    transaction
  });

  if (!sipl) {
    throw new Error("SIPL not found for the given ID.");
  }

  // Get the last combined number for this SIPL by checking inventory products
  const lastInventoryProduct: any = await models.InventoryProduct.findOne({
    where: { siplId },
    order: [["combinedNumber", "DESC"]],
    attributes: ["combinedNumber"],
    transaction,
  });

  console.log(lastInventoryProduct, lastInventoryProduct)
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
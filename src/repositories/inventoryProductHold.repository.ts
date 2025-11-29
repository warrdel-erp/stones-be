import { Transaction } from "sequelize";
import * as models from "../models";

/**
 * Create a hold on an inventory product
 */
export const createHold = async (
  data: { inventoryProductId: number; note?: string; createdById: number; customerId?: number },
  transaction?: Transaction
) => {
  return await models.InventoryProductHold.create(data, { transaction });
};

/**
 * Create multiple holds on inventory products
 */
export const createBulkHolds = async (
  holdsData: Array<{ inventoryProductId: number; note?: string; createdById: number; customerId?: number }>,
  transaction?: Transaction
) => {
  return await models.InventoryProductHold.bulkCreate(holdsData, { transaction });
};

/**
 * Find hold by inventory product ID
 */
export const findHoldByInventoryProductId = async (
  inventoryProductId: number,
  transaction?: Transaction
) => {
  return await models.InventoryProductHold.findOne({
    where: { inventoryProductId },
    include: [
      {
        association: "createdBy",
      },
    ],
    transaction,
  });
};

/**
 * Find hold by hold ID
 */
export const findHoldById = async (holdId: number) => {
  return await models.InventoryProductHold.findByPk(holdId, {
    include: [
      {
        association: "createdBy",
        attributes: ['id'],
        include: [
          {
            association: 'user',
            attributes: ['id', 'username']
          },
          {
            association: 'client',
          }
        ]
      },
      {
        association: 'customer',
        attributes: ['id', 'name']
      }
    ],
  });
};

/**
 * Delete hold by inventory product ID
 */
export const deleteHoldByInventoryProductId = async (
  inventoryProductId: number,
  transaction?: Transaction
) => {
  return await models.InventoryProductHold.destroy({
    where: { inventoryProductId },
    transaction,
  });
};



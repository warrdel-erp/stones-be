import { Transaction } from "sequelize";
import * as models from "../models";

/**
 * Create a hold on an inventory product
 */
export const createHold = async (
  data: { inventoryProductId: number; note?: string; createdById: number },
  transaction?: Transaction
) => {
  return await models.InventoryProductHold.create(data, { transaction });
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
        attributes: ["id", "username", "phone"],
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
      },
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



import { Transaction } from "sequelize";
import * as models from "../models";

export const createInventoryProducts = async (binId: number, quantity: number, transaction: Transaction) => {
  const inventoryProductsData = Array.from({ length: quantity }, () => ({
    binId,
  }));

  return await models.InventoryProduct.bulkCreate(inventoryProductsData, { transaction });
};

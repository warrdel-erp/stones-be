import * as models from "../models";
import { Transaction } from "sequelize";
import { scoped } from "../utils/scoped";

/**
 * Create a new warehouse
 */
export const createWarehouse = async (warehouseData: { locationId: number; clientId: number }, transaction?: Transaction) => {
  return await scoped(models.Warehouse).create(warehouseData as any, { transaction });
};

/**
 * Get warehouse by location id
 */
export const getWarehouseByLocationId = async (locationId: number, clientId: number) => {
  return await scoped(models.Warehouse).findOne({
    where: {
      locationId,
      clientId,
    },
  });
};

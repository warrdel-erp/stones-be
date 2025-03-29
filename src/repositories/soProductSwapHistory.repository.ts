import { Transaction } from "sequelize";
import SoProductSwapHistory from "../models/soProductSwapHistory.model";

export const createSoProductSwapHistory = async (
  data: { inventoryProductId: number; salesProductId: number },
  transaction?: Transaction
) => {
  return await SoProductSwapHistory.create(data, { transaction });
};

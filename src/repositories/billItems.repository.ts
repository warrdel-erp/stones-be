import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createBillItem = async (itemData: any, transaction?: Transaction) => {
  return await scoped(models.BillItem).create(itemData, { transaction });
};

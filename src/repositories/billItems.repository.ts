import { Transaction } from "sequelize";
import * as models from "../models";

export const createBillItem = async (itemData: any, transaction?: Transaction) => {
  return await models.BillItem.create(itemData, { transaction });
};

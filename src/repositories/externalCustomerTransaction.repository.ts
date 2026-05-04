import CustomerTransaction from "../models/customerTransaction.model";
import { Transaction } from "sequelize";

export const bulkCreateExternalTransactions = async (data: any[], transaction?: Transaction) => {
  return await CustomerTransaction.bulkCreate(data, { transaction, validate: true });
};

import { Transaction } from "sequelize";
import * as models from "../models";

/**
 * Bulk insert payment bills.
 */
export const createPaymentBills = async (data: any[], transaction?: Transaction) => {
  return await models.PaymentBill.bulkCreate(data, { transaction });
};

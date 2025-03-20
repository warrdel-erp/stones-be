import { Transaction, where } from "sequelize";
import * as models from "../models";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";

/**
 * Bulk insert payment bills.
 */
export const createPaymentBills = async (data: any[], transaction?: Transaction) => {
  return await models.PaymentBill.bulkCreate(data, { transaction });
};

// Get total paid amount of a bill
export const getTotalPaidAmountOfBill = async (
  referenceId: number,
  referenceType: (typeof PAYMENT_BILL_REFERENCE_TYPES)[keyof typeof PAYMENT_BILL_REFERENCE_TYPES]
) => {
  const amount = await models.PaymentBill.sum("amount", { where: { referenceId, referenceType } });
  return amount || 0;
};

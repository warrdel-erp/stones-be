import { Transaction } from "sequelize";
import * as models from "../models";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { sumDecimal } from "../helper";
import { scoped } from "../utils/scoped";

/**
 * Bulk insert payment bills.
 */
export const createPaymentBills = async (data: any[], transaction?: Transaction) => {
  return await scoped(models.PaymentBill).bulkCreate(data, { transaction });
};

// Get total paid amount of a bill
export const getTotalPaidAmountOfBill = async (
  referenceId: number,
  referenceType: (typeof PAYMENT_BILL_REFERENCE_TYPES)[keyof typeof PAYMENT_BILL_REFERENCE_TYPES]
) => {
  // Get the sum of PaymentBill amounts
  const paymentBillAmount = await models.PaymentBill.sum("amount", { where: { referenceId, referenceType } });

  // If referenceType is SO_INVOICE, also include AdvancedDepositSettlement amounts
  let settlementAmount = 0;
  if (referenceType === PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) {
    settlementAmount = await models.AdvancedDepositSettlement.sum("amount", {
      where: { soInvoiceId: referenceId },
    }) || 0;
  }

  const totalAmount = sumDecimal([(paymentBillAmount || 0), settlementAmount]);
  return totalAmount;
};

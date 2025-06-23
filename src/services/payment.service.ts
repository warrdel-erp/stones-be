import { sequelize } from "../config/database";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import * as billRepository from "../repositories/bill.repository";
import * as paymentRepository from "../repositories/payment.repository";
import * as paymentBillsRepository from "../repositories/paymentBills.repository";
import * as siplRepository from "../repositories/sipl.repository";
import { createJournalEntriesForPaymentBills } from "./journalEntry.service";
import * as customerRepository from "../repositories/customer.repository";
import * as vendorRepository from "../repositories/vendor.repository";

// Create a new payment
export const processPayment = async (paymentData: any, billsData: any[], locationId: number) => {
  if (!paymentData || !billsData || !Array.isArray(billsData) || billsData.length === 0) {
    throw new Error("Invalid request: Payment and bills data are required");
  }

  // Validate total amount
  const totalBillAmount = billsData.reduce((sum, bill) => sum + bill.amount, 0);

  if (totalBillAmount !== paymentData.amount) {
    throw new AppError("Total bill amount does not match payment amount", 400);
  }

  // Begin transaction
  const transaction = await sequelize.transaction();

  try {
    // Step 1: Create Payment
    const payment: any = await paymentRepository.createPayment(paymentData, transaction);

    // Step 2: Prepare Payment Bills
    const paymentBills = await Promise.all(
      billsData.map(async (bill) => {
        // Create journal entries for payment bills
        await createJournalEntriesForPaymentBills(bill, paymentData, transaction, locationId);

        return {
          paymentId: payment.id,
          referenceId: bill.referenceId,
          referenceType: bill.referenceType,
          amount: bill.amount,
          description: bill.description,
        };
      })
    );

    // Step 3: Insert Payment Bills
    const paymentBillsRes = await paymentBillsRepository.createPaymentBills(paymentBills, transaction);

    // Commit transaction
    await transaction.commit();
    return { payment, bills: paymentBillsRes };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get all payments
export const getPayments = async (filters: any, page: number, limit: number) => {
  const payments: any = await paymentRepository.getAllPayments(filters, page, limit);

  const paymentsWithPayee = await Promise.all(
    payments.payments.map(async (payment: any) => {
      let payee = null;
      if (payment.payeeType === "customer") {
        payee = await customerRepository.getCustomerById(payment.payeeId);
      } else if (payment.payeeType === "vendor") {
        payee = await vendorRepository.findVendorById(payment.payeeId);
      }
      const plainPayment = payment.get({ plain: true });

      const processedPaymentBills = plainPayment.paymentBills.map((bill: any) => {
        let reference = null;
        if (bill.referenceType === "sipl") {
          reference = bill.sipl;
        } else if (bill.referenceType === "bill") {
          reference = bill.bill;
        } else if (bill.referenceType === "soInvoice") {
          reference = bill.soInvoice;
        }
        delete bill.sipl;
        delete bill.bill;
        delete bill.soInvoice;
        return { ...bill, reference };
      });
      return { ...plainPayment, paymentBills: processedPaymentBills, payee };
    })
  );

  return { ...payments, payments: paymentsWithPayee };
};

// Get payment by id
export const getPayment = async (id: number) => {
  return await paymentRepository.getPaymentById(id);
};

// de
export const deletePayment = async (id: number) => {
  return await paymentRepository.deletePayment(id);
};

// Get new bill number
export const getTransactionNumber = async (clientId: number) => {
  return await paymentRepository.getTransactionNumber(clientId);
};

// Check if all bills belong to the vendor
export const checkIfBillsBelongToVendor = async (vendorId: number, bills: any[]) => {
  // Check bills.
  const billsIdArr = bills
    .filter((bill: any) => bill.referenceType.toLowerCase() == PAYMENT_BILL_REFERENCE_TYPES.BILL)
    .map((bill: any) => bill.referenceId);

  const areBillsBelongingToVendor = await billRepository.areBillsBelongingToVendor(vendorId, billsIdArr);

  if (!areBillsBelongingToVendor) {
    throw new AppError("Some bills do not belong to the vendor", 400);
  }

  // Check SIPLs
  const siplIdsArr = bills
    .filter((bill: any) => bill.referenceType.toLowerCase() == PAYMENT_BILL_REFERENCE_TYPES.SIPL)
    .map((bill: any) => bill.referenceId);

  const areSIPLsBelongingToVendor = await siplRepository.areSIPLsBelongingToVendor(vendorId, siplIdsArr);

  if (!areSIPLsBelongingToVendor) {
    throw new AppError("Some SIPLs do not belong to the vendor", 400);
  }
};


export const getTotalAmountByPayeeTypeAndClientId = async (payeeType: string, clientId: number) => {
  if (!payeeType || !clientId) {
    throw new Error("Both payeeType and clientId are required");
  }

  const totalAmount = await paymentRepository.getTotalAmountByPayeeTypeAndClientId(payeeType, clientId);

  return totalAmount || 0; // Return 0 if no payments found
}
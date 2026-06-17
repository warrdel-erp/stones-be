import { sequelize } from "../config/database";
import { PAYMENT_BILL_REFERENCE_TYPES, CREDIT_DEBIT_NOTE_TYPES, CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES, CREDIT_NOTE_REFERENCE_TYPES, PAYEE_TYPE, PAYMENT_STATUS } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import * as billRepository from "../repositories/bill.repository";
import * as paymentRepository from "../repositories/payment.repository";
import * as paymentBillsRepository from "../repositories/paymentBills.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as creditDebitNoteRepository from "../repositories/creditDebitNote.repository";
import * as siplService from "../services/sipl.service";
import { createJournalEntriesForPaymentBills } from "./journalEntry.service";
import * as customerRepository from "../repositories/customer.repository";
import * as vendorRepository from "../repositories/vendor.repository";
import * as models from "../models";
import { Transaction } from "sequelize";
import _ from "lodash";
import { decimalAdd, decimalSubtract, decimalGreaterThan } from "../helper/decimal";

/**
 * Customer payments guard:
 * For each Sales Order Invoice, ensure:
 *   totalInvoiceAmount >= alreadyPaid (includes settled advanced deposits) + requestedPaymentAmount
 */
const assertCustomerInvoicePayments = async (billsData: any[]) => {
  // Group requested amounts per invoice
  const requested = new Map<number, number>();
  for (const bill of billsData) {
    if (bill.referenceType !== PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) continue;
    const invoiceId = Number(bill.referenceId);
    const amt = Number(bill.amount || 0);
    requested.set(invoiceId, decimalAdd(requested.get(invoiceId) || 0, amt));
  }

  for (const [invoiceId, requestedAmount] of requested.entries()) {
    const invoice: any = await models.SalesOrderInvoice.findByPk(invoiceId);
    if (!invoice) {
      throw new AppError(`Invoice with ID ${invoiceId} not found.`, 400);
    }

    const totalInvoiceAmount = Number(invoice.finalAmount || 0);
    // alreadyPaid includes settled Advanced Deposits via repository helper
    const alreadyPaid =
      (await paymentBillsRepository.getTotalPaidAmountOfBill(
        invoiceId,
        PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE
      )) || 0;

    const totalAfterPayment = decimalAdd(alreadyPaid, requestedAmount);
    if (decimalGreaterThan(totalAfterPayment, totalInvoiceAmount)) {
      const remaining = decimalSubtract(totalInvoiceAmount, alreadyPaid);
      throw new AppError(
        `Invoice ${invoiceId} overpayment: remaining ${remaining.toFixed(2)}, attempted ${requestedAmount.toFixed(2)}.`,
        400
      );
    }
  }
};

/**
 * Vendor payments guard:
 * For each SIPL/Bill, ensure:
 *   totalDocumentAmount >= alreadyPaid + requestedPaymentAmount
 */
const assertVendorPayments = async (billsData: any[]) => {
  // Group requested amounts per reference (SIPL/BILL)
  const requested = new Map<string, { referenceType: string; referenceId: number; amount: number }>();

  for (const bill of billsData) {
    if (
      bill.referenceType !== PAYMENT_BILL_REFERENCE_TYPES.SIPL &&
      bill.referenceType !== PAYMENT_BILL_REFERENCE_TYPES.BILL
    )
      continue;

    const referenceId = Number(bill.referenceId);
    const referenceType = bill.referenceType;
    const key = `${referenceType}:${referenceId}`;
    const amt = Number(bill.amount || 0);

    const current = requested.get(key) || { referenceType, referenceId, amount: 0 };
    current.amount = decimalAdd(current.amount, amt);
    requested.set(key, current);
  }

  for (const { referenceType, referenceId, amount: requestedAmount } of requested.values()) {
    let totalDocumentAmount = 0;

    if (referenceType === PAYMENT_BILL_REFERENCE_TYPES.SIPL) {
      const siplCalc = await siplService.getSiplCalculations(referenceId);
      totalDocumentAmount = Number(siplCalc.totalAmount || 0);

      const existingCreditNotes: any[] = await models.CreditDebitNote.findAll({
        where: { referenceType: CREDIT_NOTE_REFERENCE_TYPES.SIPL, referenceId: referenceId }
      });
      const existingCreditAmount = _.sumBy(existingCreditNotes, (cn: any) => parseFloat(cn.amount)) || 0;
      totalDocumentAmount = decimalSubtract(totalDocumentAmount, existingCreditAmount);
    } else if (referenceType === PAYMENT_BILL_REFERENCE_TYPES.BILL) {
      const billRecord: any = await billRepository.getBillByPk(referenceId);
      if (!billRecord) {
        throw new AppError(`Bill with ID ${referenceId} not found.`, 400);
      }
      totalDocumentAmount = Number(billRecord.amount || 0);
    }

    const alreadyPaid =
      (await paymentBillsRepository.getTotalPaidAmountOfBill(referenceId, referenceType as any)) || 0;

    const totalAfterPayment = decimalAdd(alreadyPaid, requestedAmount);
    if (decimalGreaterThan(totalAfterPayment, totalDocumentAmount)) {
      const remaining = decimalSubtract(totalDocumentAmount, alreadyPaid);
      throw new AppError(
        `Reference ${referenceType} ID ${referenceId} overpayment: remaining ${remaining.toFixed(
          2
        )}, attempted ${requestedAmount.toFixed(2)}.`,
        400
      );
    }
  }
};

// Create credit debit note for payment
const createCreditNoteForPayment = async (amount: number, paymentData: any, paymentId: number, transaction: any) => {

  let note = null;
  if (paymentData.creditNote?.amount && paymentData.payeeType == PAYEE_TYPE.CUSTOMER) {

    note = {
      amount: amount,
      type: CREDIT_DEBIT_NOTE_TYPES.CREDIT,
      entryFor: CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES.CUSTOMER,
      entryIdFor: paymentData.payeeId,
      referenceType: CREDIT_NOTE_REFERENCE_TYPES.PAYMENT,
      referenceId: paymentId,
      clientId: paymentData.clientId,
    };

  } else if (paymentData.debitNote?.amount && paymentData.payeeType == PAYEE_TYPE.VENDOR) {

    note = {
      amount: amount,
      type: CREDIT_DEBIT_NOTE_TYPES.DEBIT,
      entryFor: CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES.VENDOR,
      entryIdFor: paymentData.payeeId,
      referenceType: CREDIT_NOTE_REFERENCE_TYPES.PAYMENT,
      referenceId: paymentId,
      clientId: paymentData.clientId
    };
  }

  return await creditDebitNoteRepository.createCreditDebitNote(note, transaction);
};

// Create a new payment
export const processPayment = async (paymentData: any, billsData: any[], locationId: number) => {
  if (!paymentData || !billsData || !Array.isArray(billsData) || billsData.length === 0) {
    throw new Error("Invalid request: Payment and bills data are required");
  }

  // Validate that payments do not exceed document totals.
  if (paymentData.payeeType === PAYEE_TYPE.CUSTOMER) {
    await assertCustomerInvoicePayments(billsData);
  } else if (paymentData.payeeType === PAYEE_TYPE.VENDOR) {
    await assertVendorPayments(billsData);
  }

  const totalPaymentBillsAmount = _.sumBy(billsData, 'amount');

  const creditDebitNoteAmount = paymentData.amount - totalPaymentBillsAmount;
  // Begin transaction
  const transaction = await sequelize.transaction();

  try {
    // Step 1: Create Payment
    const payment: any = await paymentRepository.createPayment({ ...paymentData, accountId: paymentData.account, status: PAYMENT_STATUS.COMPLETE }, transaction);

    // Step 2: Handle Credit Note Creation (if creditNote exists in paymentData)
    let creditDebitNote = {}
    if (creditDebitNoteAmount > 0) {
      creditDebitNote = await createCreditNoteForPayment(creditDebitNoteAmount, paymentData, payment.id, transaction);
    }

    // Step 3: Prepare Payment Bills
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

    // Step 4: Insert Payment Bills
    const paymentBillsRes = await paymentBillsRepository.createPaymentBills(paymentBills, transaction);

    // Commit transaction
    await transaction.commit();
    return { payment, bills: paymentBillsRes, creditDebitNote };
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
  const payment: any = await paymentRepository.getPaymentById(id);

  let payee = null;
  if (payment.payeeType === "customer") {
    payee = await customerRepository.getCustomerById(payment.payeeId);
  } else if (payment.payeeType === "vendor") {
    payee = await vendorRepository.findVendorById(payment.payeeId);
  }
  const plainPayment = payment.get({ plain: true });

  const processedPaymentBills = plainPayment.paymentBills.map((bill: any) => {
    let reference = null;
    if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SIPL) {
      reference = bill.sipl;
    } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.BILL) {
      reference = bill.bill;
    } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) {
      reference = bill.soInvoice;
    } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.ADVANCED_DEPOSIT) {
      reference = bill.advancedDeposit;
    }

    delete bill.sipl;
    delete bill.bill;
    delete bill.soInvoice;
    return { ...bill, reference };
  });

  return { ...plainPayment, paymentBills: processedPaymentBills, payee };
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


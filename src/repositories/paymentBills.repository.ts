import { Op, Transaction } from "sequelize";
import * as models from "../models";
import {
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  PAYMENT_BILL_REFERENCE_TYPES,
} from "../constants/tableTypes";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import { sumDecimal } from "../helper";
import { decimalSubtract } from "../helper/decimal";
import { scoped } from "../utils/scoped";

/**
 * Bulk insert payment bills.
 */
export const createPaymentBills = async (data: any[], transaction?: Transaction) => {
  return await scoped(models.PaymentBill).bulkCreate(data, { transaction });
};

/**
 * Get full settlement breakdown for a Sales Order Invoice:
 * - Direct Customer Payments (PaymentBill)
 * - Advanced Deposit Settlements (AdvancedDepositSettlement)
 * - Bad Debt Write-Offs (JournalEntry -> Bad Debt Expense)
 * - Confirmed Sales Returns (Return -> Customer Receivable credit)
 */
export const getInvoiceSettlementBreakdown = async (
  invoiceId: number,
  finalAmount?: number
) => {
  // 1. Direct Payments
  const paymentBills: any[] = await models.PaymentBill.findAll({
    where: {
      referenceId: invoiceId,
      referenceType: PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE,
    },
    include: [
      {
        model: models.Payment,
        as: "payment",
        attributes: [
          "id",
          "transactionCode",
          "clientTransactionNo",
          "paymentMethod",
          "referenceNo",
          "referenceDate",
          "remark",
          "createdAt",
        ],
      },
    ],
  });

  const paymentRecords = paymentBills.map((pb: any) => {
    const plain = pb.get ? pb.get({ plain: true }) : pb;
    return {
      id: plain.id,
      paymentId: plain.paymentId,
      amount: Number(plain.amount || 0),
      paymentMethod: plain.payment?.paymentMethod || null,
      transactionCode:
        plain.payment?.transactionCode ||
        (plain.payment?.clientTransactionNo
          ? `TXN-${plain.payment.clientTransactionNo}`
          : null),
      referenceNo: plain.payment?.referenceNo || null,
      date: plain.payment?.referenceDate || plain.payment?.createdAt || plain.createdAt,
    };
  });
  const paymentAmount = sumDecimal(paymentRecords, "amount");

  // 2. Advanced Deposit Settlements
  const depositSettlements: any[] = await models.AdvancedDepositSettlement.findAll({
    where: { soInvoiceId: invoiceId },
    include: [
      {
        model: models.AdvancedDeposit,
        as: "advancedDeposit",
        attributes: ["id", "code", "createdAt"],
        include: [
          {
            model: models.Payment,
            as: "payment",
            attributes: ["id", "paymentMethod"],
          },
        ],
      },
    ],
  });

  const advancedDepositRecords = depositSettlements.map((ds: any) => {
    const plain = ds.get ? ds.get({ plain: true }) : ds;
    return {
      id: plain.id,
      advancedDepositId: plain.advancedDepositId,
      code: plain.advancedDeposit?.code || `AD-${plain.advancedDepositId}`,
      amount: Number(plain.amount || 0),
      paymentMethod: plain.advancedDeposit?.payment?.paymentMethod || null,
      date: plain.createdAt || plain.advancedDeposit?.createdAt,
    };
  });
  const advancedDepositAmount = sumDecimal(advancedDepositRecords, "amount");

  // 3. Bad Debt Write-Offs
  const writeOffEntries: any[] = await models.JournalEntry.findAll({
    attributes: ["id", "amount", "createdAt"],
    where: {
      referenceId: invoiceId,
      referenceType: {
        [Op.in]: [
          JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
          JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        ],
      },
      type: JOURNAL_ENTRY_TYPE.DR,
    },
    include: [
      {
        model: models.LedgerAccount,
        as: "ledgerAccount",
        attributes: [],
        where: {
          key: DEFAULT_LEDGER_ACCOUNT_KEYS.BAD_DEBT_EXPENSE,
        },
        required: true,
      },
    ],
    raw: true,
  });

  const writeOffRecords = writeOffEntries.map((entry: any) => ({
    id: entry.id,
    amount: Number(entry.amount || 0),
    date: entry.createdAt,
  }));
  const writeOffAmount = sumDecimal(writeOffRecords, "amount");

  // 4. Confirmed Sales Returns
  const completedReturns: any[] = await models.Return.findAll({
    attributes: ["id", "code", "createdAt"],
    where: {
      invoiceId,
      status: "complete",
    },
    raw: true,
  });

  let returnRecords: any[] = [];
  let returnAmount = 0;

  if (completedReturns.length > 0) {
    const returnIds = completedReturns.map((r: any) => r.id);
    const returnCreditEntries: any[] = await models.JournalEntry.findAll({
      attributes: ["referenceId", "amount", "createdAt"],
      where: {
        referenceId: { [Op.in]: returnIds },
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
        type: JOURNAL_ENTRY_TYPE.CR,
      },
      include: [
        {
          model: models.LedgerAccount,
          as: "ledgerAccount",
          attributes: [],
          where: {
            referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
          },
          required: true,
        },
      ],
      raw: true,
    });

    returnRecords = completedReturns.map((ret: any) => {
      const entriesForReturn = returnCreditEntries.filter(
        (e: any) => Number(e.referenceId) === Number(ret.id)
      );
      const amt = sumDecimal(entriesForReturn, "amount");
      return {
        id: ret.id,
        code: ret.code || `RO-${ret.id}`,
        amount: Number(amt || 0),
        date: ret.createdAt,
      };
    });
    returnAmount = sumDecimal(returnRecords, "amount");
  }

  const totalSettled = sumDecimal([
    paymentAmount,
    advancedDepositAmount,
    writeOffAmount,
    returnAmount,
  ]);

  // Build concise human-readable summary parts
  const summaryParts: string[] = [];
  if (paymentAmount > 0) {
    summaryParts.push(`Payment: $${Number(paymentAmount).toFixed(2)}`);
  }
  if (advancedDepositAmount > 0) {
    const codes = Array.from(
      new Set(advancedDepositRecords.map((r) => r.code).filter(Boolean))
    ).join(", ");
    summaryParts.push(
      `Adv. Deposit${codes ? ` (${codes})` : ""}: $${Number(advancedDepositAmount).toFixed(2)}`
    );
  }
  if (writeOffAmount > 0) {
    summaryParts.push(`Write-Off: $${Number(writeOffAmount).toFixed(2)}`);
  }
  if (returnAmount > 0) {
    const roCodes = Array.from(
      new Set(returnRecords.map((r) => r.code).filter(Boolean))
    ).join(", ");
    summaryParts.push(
      `Return${roCodes ? ` (${roCodes})` : ""}: $${Number(returnAmount).toFixed(2)}`
    );
  }

  const invoiceTotal = finalAmount !== undefined ? Number(finalAmount || 0) : undefined;
  const dueAmount =
    invoiceTotal !== undefined
      ? Math.max(0, Number(decimalSubtract(invoiceTotal, totalSettled)))
      : undefined;

  let status = "Unpaid";
  if (totalSettled > 0) {
    if (dueAmount !== undefined && dueAmount <= 0) {
      if (
        writeOffAmount > 0 &&
        paymentAmount === 0 &&
        advancedDepositAmount === 0 &&
        returnAmount === 0
      ) {
        status = "Written Off";
      } else if (
        returnAmount > 0 &&
        paymentAmount === 0 &&
        advancedDepositAmount === 0 &&
        writeOffAmount === 0
      ) {
        status = "Returned";
      } else if (writeOffAmount > 0 || returnAmount > 0) {
        status = "Settled";
      } else {
        status = "Paid";
      }
    } else {
      status = "Partially Settled";
    }
  }

  return {
    paymentAmount: Number(paymentAmount || 0),
    payments: paymentRecords,
    advancedDepositAmount: Number(advancedDepositAmount || 0),
    advancedDeposits: advancedDepositRecords,
    writeOffAmount: Number(writeOffAmount || 0),
    writeOffs: writeOffRecords,
    returnAmount: Number(returnAmount || 0),
    returns: returnRecords,
    totalSettled: Number(totalSettled || 0),
    dueAmount,
    status,
    settlementSummary: summaryParts.join(" | "),
  };
};

// Get total paid amount of a bill
export const getTotalPaidAmountOfBill = async (
  referenceId: number,
  referenceType: (typeof PAYMENT_BILL_REFERENCE_TYPES)[keyof typeof PAYMENT_BILL_REFERENCE_TYPES]
) => {
  if (referenceType === PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) {
    const breakdown = await getInvoiceSettlementBreakdown(referenceId);
    return breakdown.totalSettled;
  }

  // Get the sum of PaymentBill amounts for non-SO_INVOICE bills (e.g., SIPL, Vendor Bill)
  const paymentBillAmount = await models.PaymentBill.sum("amount", {
    where: { referenceId, referenceType },
  });

  const journalReferenceType =
    referenceType === PAYMENT_BILL_REFERENCE_TYPES.SIPL
      ? JOURNAL_ENTRY_REFERENCE_TYPES.SIPL
      : JOURNAL_ENTRY_REFERENCE_TYPES.BILL;

  const writeOffEntries: any[] = await models.JournalEntry.findAll({
    attributes: ["amount"],
    where: {
      referenceId,
      referenceType: journalReferenceType,
      type: JOURNAL_ENTRY_TYPE.CR,
    },
    include: [
      {
        model: models.LedgerAccount,
        as: "ledgerAccount",
        attributes: [],
        where: {
          key: DEFAULT_LEDGER_ACCOUNT_KEYS.ACCOUNTS_PAYABLE_WRITE_OFF_INCOME,
        },
        required: true,
      },
    ],
    raw: true,
  });

  const writeOffAmount = sumDecimal(writeOffEntries, "amount");

  return sumDecimal([paymentBillAmount || 0, writeOffAmount || 0]);
};

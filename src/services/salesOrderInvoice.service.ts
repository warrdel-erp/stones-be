import _ from "lodash";
import { AppError } from "../helper/appError";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";
import * as packagingListService from '../services/packagingList.service';
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as ledgerAccountService from "./ledgerAccount.service";
import { sequelize } from "../config/database";
import * as decimal from "../helper/decimal";
import {
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  PAYMENT_BILL_REFERENCE_TYPES,
} from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";

export const fetchTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {
  return await salesOrderInvoiceRepository.getTotalAmountFromLastNDays(fromDate, toDate, clientId);
};

export const getTotalAmountForClient = async (clientId: number) => {
  return await salesOrderInvoiceRepository.getTotalAmountForClient(clientId);
};

export const assignTruck = async (id: number, truckId: number) => {
  const soInvoice = (await salesOrderInvoiceRepository.getInvoiceById(id))?.get({ plain: true });

  if (!soInvoice) {
    throw new AppError("Invoice does not exists.", 400);
  }

  return await salesOrderInvoiceRepository.assignTruck(id, truckId);
};

export const getInvoiceById = async (id: number) => {
  const soInvoiceInstance: any = await salesOrderInvoiceRepository.getInvoiceDetailsById(id);

  if (!soInvoiceInstance) {
    throw new AppError("Invoice does not exists.", 400);
  }

  const finalAmount = soInvoiceInstance.finalAmount;
  const soInvoice = soInvoiceInstance.get({ plain: true });
  soInvoice.finalAmount = finalAmount;

  let relevantProducts = [];

  if (soInvoice.loadingOrderId) {
    // It's a Loading Order Invoice
    relevantProducts = soInvoice.loadingOrder?.salesOrderProducts || [];
  } else if (soInvoice.packagingListId) {
    // It's a Packaging List Invoice
    // Filter to only products that are NOT assigned to an LO
    relevantProducts = (soInvoice.packagingList?.salesOrderProducts || []).filter((p: any) => p.loadingOrderId === null);
  }

  soInvoice.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(relevantProducts, soInvoice.discountPercentage || soInvoice.salesOrder?.discountPercentage);

  const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(relevantProducts, soInvoice.discountPercentage || soInvoice.salesOrder?.discountPercentage, relevantProducts[0]?.salesOrder?.tax?.value || relevantProducts[0]?.taxPercentage || 0);

  const settlementBreakdown = await paymentBillRepository.getInvoiceSettlementBreakdown(
    soInvoice.id,
    finalAmount
  );

  return {
    ...soInvoice,
    calculations,
    paidAmount: settlementBreakdown.totalSettled,
    dueAmount: settlementBreakdown.dueAmount,
    balanceAmount: settlementBreakdown.dueAmount,
    status: settlementBreakdown.status,
    settlementSummary: settlementBreakdown.settlementSummary,
    settlementBreakdown,
  };
};

export const getAllSoInvoiceList = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit);

  data.rows = await Promise.all(
    data.rows.map(async (invoice: any) => {
      const finalAmount = invoice.finalAmount;
      invoice = invoice.get({ plain: true });

      let relevantProducts = [];
      if (invoice.loadingOrderId) {
        relevantProducts = invoice.loadingOrder?.salesOrderProducts || [];
      } else if (invoice.packagingListId) {
        relevantProducts = (invoice.packagingList?.salesOrderProducts || []).filter((p: any) => p.loadingOrderId === null);
      }

      invoice.totalQuantity = _.sumBy(
        relevantProducts,
        (item: any) => item.isSlabType ? item.finalSqrFt : 1
      );

      invoice.totalSlabs = relevantProducts.filter((salesOrderProduct: any) => salesOrderProduct.isSlabType).length;
      invoice.totalGenericProducts = relevantProducts.length - invoice.totalSlabs;
      invoice.finalAmount = finalAmount;

      const settlementBreakdown = await paymentBillRepository.getInvoiceSettlementBreakdown(
        invoice.id,
        finalAmount
      );

      invoice.paidAmount = settlementBreakdown.totalSettled;
      invoice.dueAmount = settlementBreakdown.dueAmount;
      invoice.balanceAmount = settlementBreakdown.dueAmount;
      invoice.status = settlementBreakdown.status;
      invoice.settlementSummary = settlementBreakdown.settlementSummary;
      invoice.settlementBreakdown = settlementBreakdown;

      return { ...invoice };
    })
  );

  return data;
};

export const getAllSoInvoiceListWithTruckOnly = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit, true);

  data.rows = data.rows.map((invoice: any) => {
    const finalAmount = invoice.finalAmount;
    invoice = invoice.get({ plain: true });

    if (invoice.packagingList.loadingOrder) {
      invoice.totalQuantity = _.sumBy(
        invoice.packagingList.salesOrderProducts,
        (item: any) => item.loRemeasureLength * item.loRemeasureWidth
      );
    } else {
      invoice.totalQuantity = _.sumBy(
        invoice.packagingList.salesOrderProducts,
        (item: any) => item.plRemeasureLength * item.plRemeasureWidth
      );
    }

    invoice.totalSlabs = invoice.packagingList.salesOrderProducts.length;
    invoice.finalAmount = finalAmount;

    return { ...invoice };
  });

  return data;
};

/**
 * Get sales order products without returns for a specific invoice
 */
export const getSalesOrderProductsWithoutReturns = async (soInvoiceId: number) => {
  const soInvoice = await salesOrderInvoiceRepository.getInvoiceById(soInvoiceId);

  if (!soInvoice) {
    throw new AppError("Invoice does not exist.", 404);
  }

  const products = await salesOrderInvoiceRepository.getSalesOrderProductsWithoutReturns(soInvoiceId);
  return products;
};

export const getOverdueInvoices = async (clientId: number, customerId?: number) => {
  const invoices = await salesOrderInvoiceRepository.getOverdueInvoicesRaw(clientId, customerId);

  const overdueUnpaidInvoices = [];
  const today = new Date();

  for (const invoice of invoices) {
    const plainInvoice = invoice.get({ plain: true });

    // Dynamic Due Date Calculation: Lo Date + payment terms
    const dueDate = new Date(plainInvoice.packagingList.plDate);
    const paymentTermId = plainInvoice.packagingList.paymentTermId || plainInvoice.packagingList.salesOrder?.paymentTermId;

    if (paymentTermId) {
      const term = PAYMENT_TERMS.find(t => t.id === paymentTermId);
      if (term && term.value !== "COD") {
        dueDate.setDate(dueDate.getDate() + parseInt(term.value));
      }
    }

    if (dueDate < today) {
      const settlementBreakdown = await paymentBillRepository.getInvoiceSettlementBreakdown(
        plainInvoice.id,
        plainInvoice.finalAmount
      );
      const paidAmount = settlementBreakdown.totalSettled;

      if (paidAmount < plainInvoice.finalAmount) {
        overdueUnpaidInvoices.push({
          ...plainInvoice,
          dueDate,
          paidAmount,
          balanceAmount: Number((plainInvoice.finalAmount - paidAmount).toFixed(2)),
          status: settlementBreakdown.status,
          settlementSummary: settlementBreakdown.settlementSummary,
          settlementBreakdown,
        });
      }
    }
  }

  return overdueUnpaidInvoices;
};

/**
 * Customer Write-Off (Direct Write-Off Method):
 * Writes off an uncollectible balance on a Sales Order Invoice by debiting Bad Debt Expense (DR)
 * and crediting the Customer's Accounts Receivable ledger (CR).
 */
export const writeOffCustomerInvoice = async (
  invoiceId: number,
  clientId: number,
  locationId: number,
  amount?: number
) => {
  const transaction = await sequelize.transaction();

  try {
    const soInvoiceInstance: any = await salesOrderInvoiceRepository.getInvoiceById(invoiceId);
    if (!soInvoiceInstance) {
      throw new AppError("Invoice does not exist.", 404);
    }

    const finalAmount = Number(soInvoiceInstance.finalAmount || 0);
    const soInvoice = soInvoiceInstance.get({ plain: true });

    const alreadyPaid =
      (await paymentBillRepository.getTotalPaidAmountOfBill(
        invoiceId,
        PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE
      )) || 0;

    const remainingBalance = decimal.decimalSubtract(finalAmount, alreadyPaid);
    if (remainingBalance <= 0) {
      throw new AppError("Invoice has no remaining unpaid balance to write off.", 400);
    }

    const writeOffAmount = amount !== undefined ? Number(amount) : remainingBalance;
    if (writeOffAmount <= 0 || decimal.decimalGreaterThan(writeOffAmount, remainingBalance)) {
      throw new AppError(
        `Invalid write-off amount (${writeOffAmount.toFixed(2)}). Remaining unpaid balance is ${remainingBalance.toFixed(2)}.`,
        400
      );
    }

    const customerLedgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter(
      {
        referenceId: soInvoice.customerId,
        referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
      },
      transaction
    );

    if (!customerLedgerAccount) {
      throw new AppError("Customer ledger account not found.", 404);
    }

    let badDebtLedgerAccount: any = await ledgerAccountService.getBadDebtExpenseLedgerAccount(
      clientId,
      transaction
    );

    if (!badDebtLedgerAccount) {
      badDebtLedgerAccount = await ledgerAccountService.createBadDebtExpenseLedgerAccount(
        clientId,
        transaction
      );
    }

    const isLoadingOrderInvoice = Boolean(soInvoice.loadingOrderId);
    const referenceType = isLoadingOrderInvoice
      ? JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE
      : JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE;
    const entryFor = isLoadingOrderInvoice
      ? JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER
      : JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST;
    const entryForId = isLoadingOrderInvoice
      ? soInvoice.loadingOrderId
      : soInvoice.packagingListId;

    // 1. DR Bad Debt Expense (Credit Loss Expense)
    await journalEntryRepository.create(
      {
        amount: writeOffAmount,
        ledgerId: badDebtLedgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.DR,
        referenceType,
        referenceId: soInvoice.id,
        entryFor,
        entryForId,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
        locationId,
        partyLedgerAccountId: customerLedgerAccount.id,
      },
      transaction
    );

    // 2. CR Customer Account (Accounts Receivable)
    await journalEntryRepository.create(
      {
        amount: writeOffAmount,
        ledgerId: customerLedgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.CR,
        referenceType,
        referenceId: soInvoice.id,
        entryFor,
        entryForId,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
        locationId,
        partyLedgerAccountId: badDebtLedgerAccount.id,
      },
      transaction
    );

    await transaction.commit();
    return {
      invoiceId: soInvoice.id,
      writtenOffAmount: writeOffAmount,
      remainingBalance: decimal.decimalSubtract(remainingBalance, writeOffAmount),
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
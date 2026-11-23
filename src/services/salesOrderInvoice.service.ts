import _ from "lodash";
import { Op } from "sequelize";
import { AppError } from "../helper/appError";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";
import * as packagingListService from '../services/packagingList.service';
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as termsConditionRepository from "../repositories/termsCondition.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as ledgerAccountService from "./ledgerAccount.service";
import * as activityService from "./activity.service";
import { sequelize } from "../config/database";
import * as decimal from "../helper/decimal";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { isSalesOrderDraft } from "../utils/salesOrder.util";
import { getPercentageValue } from "../helper";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import { INVENTORY_ITEM_STATUS, SALES_TAX, PAYMENT_TERMS } from "../constants";
import {
  ACTIVITY_REFERENCE_TYPE,
  ACTIVITY_TYPE,
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  PACKAGING_LIST_STAGES,
  PAYMENT_BILL_REFERENCE_TYPES,
  SALE_ORDER_PRODUCT_STAGES,
} from "../constants/tableTypes";

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

  if (soInvoice.salesOrderProducts && soInvoice.salesOrderProducts.length > 0) {
    relevantProducts = soInvoice.salesOrderProducts;
  } else if (soInvoice.loadingOrderId) {
    // It's a Loading Order Invoice
    relevantProducts = soInvoice.loadingOrder?.salesOrderProducts || [];
  } else if (soInvoice.packagingListId) {
    // It's a Packaging List Invoice
    // Filter to only products that are NOT assigned to an LO
    relevantProducts = (soInvoice.packagingList?.salesOrderProducts || []).filter((p: any) => p.loadingOrderId === null);
  }

  const effectiveInvoiceDiscount =
    soInvoice.discountPercentage !== null && soInvoice.discountPercentage !== undefined
      ? Number(soInvoice.discountPercentage)
      : Number(soInvoice.salesOrder?.discountPercentage || 0);

  soInvoice.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(relevantProducts, effectiveInvoiceDiscount);

  const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(relevantProducts, effectiveInvoiceDiscount, relevantProducts[0]?.salesOrder?.tax?.value || relevantProducts[0]?.taxPercentage || 0);

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
      if (invoice.salesOrderProducts && invoice.salesOrderProducts.length > 0) {
        relevantProducts = invoice.salesOrderProducts;
      } else if (invoice.loadingOrderId) {
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

export const createSalesOrderInvoice = async (
  data: any,
  clientId: number,
  locationId: number,
  createdById?: number
) => {
  const transaction = await sequelize.transaction();

  try {
    if (!data?.salesOrderId) {
      throw new AppError("Sales Order ID is required.", 400);
    }

    if (!data?.soProducts || !Array.isArray(data.soProducts) || data.soProducts.length === 0) {
      throw new AppError("At least one product must be selected to create an invoice.", 400);
    }

    const salesOrder: any = await salesOrderRepository.getSimpleSalesOrder(Number(data.salesOrderId), transaction);
    if (!salesOrder) {
      throw new AppError("Sales Order not found", 404);
    }

    if (isSalesOrderDraft(salesOrder)) {
      throw new AppError("Cannot invoice an unconfirmed Sales Order. Please confirm the Sales Order first.", 400);
    }

    // Extract product IDs
    const productIds: number[] = data.soProducts.map((p: any) => (typeof p === "object" ? Number(p.id) : Number(p)));

    // Fetch the actual sales order product instances
    const selectedProducts: any[] = await scoped(models.SalesOrderProduct).findAll({
      where: {
        id: { [Op.in]: productIds },
        salesOrderId: salesOrder.id,
      },
      include: [
        {
          association: "inventoryProduct",
          include: [
            { association: "product" },
            { association: "slab" },
            { association: "genericProduct" },
          ],
        },
        { association: "packagingList" },
        { association: "loadingOrder" },
      ],
      transaction,
    });

    if (selectedProducts.length !== productIds.length) {
      throw new AppError("Some selected products were not found or do not belong to this Sales Order.", 400);
    }

    // Validate that none of the products are already invoiced, and that all have PL or LO assigned
    const affectedPlIds = new Set<number>();
    const affectedLoIds = new Set<number>();

    for (const prod of selectedProducts) {
      if (prod.salesOrderInvoiceId || prod.stage === SALE_ORDER_PRODUCT_STAGES.INVOICED) {
        throw new AppError(`Product ${prod.id} is already invoiced.`, 400);
      }
      if (!prod.packagingListId && !prod.loadingOrderId) {
        throw new AppError(`Product ${prod.id} is not assigned to any Pick List or Loading Order.`, 400);
      }
      if (prod.packagingListId) affectedPlIds.add(prod.packagingListId);
      if (prod.loadingOrderId) affectedLoIds.add(prod.loadingOrderId);
    }

    // Calculate totals using getTotalsOfSalesOrderProducts
    const effectiveDiscount =
      salesOrder.discountPercentage !== null && salesOrder.discountPercentage !== undefined
        ? Number(salesOrder.discountPercentage)
        : 0;

    const taxRate =
      salesOrder.tax?.value ||
      (salesOrder.taxId ? SALES_TAX.find((e: any) => e.id === salesOrder.taxId)?.value : null) ||
      selectedProducts[0]?.taxPercentage ||
      0;

    const calcs = salesOrderProductRepository.getTotalsOfSalesOrderProducts(
      selectedProducts,
      effectiveDiscount,
      Number(taxRate)
    );

    const invoiceAmountObj = calcs.final;

    // Services (passed in payload or default SO services)
    let serviceTotals = 0;
    let serviceTax = 0;
    if (Array.isArray(data.services) && data.services.length) {
      serviceTotals = decimal.decimalSum(
        data.services.map((e: any) => {
          const itemTotal =
            e.total !== undefined && e.total !== null
              ? Number(e.total)
              : Number(e.price || 0) * (e.chargeType === "variable" ? (Number(e.quantity) || 1) : 1);
          return itemTotal;
        })
      );
      serviceTax = decimal.decimalSum(
        data.services.map((e: any) => {
          if (e.taxAmount !== undefined && e.taxAmount !== null) {
            return Number(e.taxAmount);
          }
          const itemTotal =
            e.total !== undefined && e.total !== null
              ? Number(e.total)
              : Number(e.price || 0) * (e.chargeType === "variable" ? (Number(e.quantity) || 1) : 1);
          return (itemTotal * Number(taxRate || 0)) / 100;
        })
      );
    }

    const totalTaxable = decimal.decimalAdd(invoiceAmountObj.taxable, serviceTotals);
    const totalTax = decimal.decimalAdd(invoiceAmountObj.tax, serviceTax);

    // Fetch Commercial Terms & Conditions
    const termsRecord: any = await termsConditionRepository.getTermsConditionByFilter({ clientId }, transaction);
    if (!termsRecord || !termsRecord.details) {
      throw new AppError("Please set Commercial Terms & Conditions first.", 400);
    }

    const finalLocationId = locationId || salesOrder.locationId;

    // Create the Invoice
    const invoice: any = await salesOrderInvoiceRepository.createInvoice(
      {
        clientId,
        locationId: finalLocationId,
        customerId: salesOrder.customerId,
        salesOrderId: salesOrder.id,
        loadingOrderId: affectedLoIds.size === 1 && affectedPlIds.size === 0 ? Array.from(affectedLoIds)[0] : undefined,
        packagingListId: affectedPlIds.size === 1 && affectedLoIds.size === 0 ? Array.from(affectedPlIds)[0] : undefined,
        amount: invoiceAmountObj.subTotal - (invoiceAmountObj.inlineDiscountAmount || 0),
        taxableAmount: totalTaxable,
        taxValue: totalTax,
        totalServiceCharges: serviceTotals,
        discountPercentage: effectiveDiscount,
        discountAmount: invoiceAmountObj.discountAmount,
        termsAndConditions: termsRecord.details,
      },
      transaction
    );

    // Customer Ledger Account
    const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      referenceId: salesOrder.customerId,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    }, transaction);

    const ledgerAccountForGoodsSold: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      clientId,
    }, transaction);

    // Determine entryFor and entryForId for journal entries
    const entryFor = affectedLoIds.size > 0 ? JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER : JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST;
    const entryForId = affectedLoIds.size > 0 ? Array.from(affectedLoIds)[0] : (Array.from(affectedPlIds)[0] || 0);

    // 1. DR Customer Account (Invoice Total with tax + service tax)
    await journalEntryRepository.create(
      {
        amount: decimal.decimalAdd(invoiceAmountObj.total, serviceTax),
        ledgerId: ledgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.DR,
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,
        entryFor,
        entryForId,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId: finalLocationId,
        partyLedgerAccountId: ledgerAccountForGoodsSold.id,
      },
      transaction
    );

    // 2. CR Goods Sold (Gross Revenue before discounts)
    await journalEntryRepository.create(
      {
        amount: invoiceAmountObj.subTotal,
        ledgerId: ledgerAccountForGoodsSold.id,
        type: JOURNAL_ENTRY_TYPE.CR,
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,
        entryFor,
        entryForId,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId: finalLocationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    // 3. DR Sales Discounts (if any)
    const totalDiscountAmount = decimal.decimalAddDP(
      invoiceAmountObj.inlineDiscountAmount || 0,
      invoiceAmountObj.discountAmount || 0,
      2
    );

    if (totalDiscountAmount > 0) {
      let ledgerAccountForSalesDiscounts: any =
        await ledgerAccountService.getSalesDiscountsLedgerAccount(clientId, transaction);

      if (!ledgerAccountForSalesDiscounts) {
        ledgerAccountForSalesDiscounts =
          await ledgerAccountService.createSalesDiscountsLedgerAccount(clientId, transaction);
      }

      await journalEntryRepository.create(
        {
          amount: totalDiscountAmount,
          ledgerId: ledgerAccountForSalesDiscounts.id,
          type: JOURNAL_ENTRY_TYPE.DR,
          referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
          referenceId: invoice.id,
          entryFor,
          entryForId,
          processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
          locationId: finalLocationId,
          partyLedgerAccountId: ledgerAccount.id,
        },
        transaction
      );
    }

    // 4. CR Taxes (State & County)
    const customerTax =
      salesOrder.tax ||
      (salesOrder.taxId ? SALES_TAX.find((e: any) => e.id === salesOrder.taxId) : null) ||
      0;

    const ledgerAccountForStateTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
      clientId,
    }, transaction);

    const ledgerAccountForCountyTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
      clientId,
    }, transaction);

    const stateTaxRate = customerTax?.stateTax || 0;
    const stateTaxAmount = getPercentageValue(totalTaxable, stateTaxRate);
    const countyTaxAmount = decimal.decimalSubtract(totalTax, stateTaxAmount);

    if (stateTaxAmount > 0 && ledgerAccountForStateTax) {
      await journalEntryRepository.create(
        {
          amount: stateTaxAmount,
          ledgerId: ledgerAccountForStateTax.id,
          type: JOURNAL_ENTRY_TYPE.CR,
          referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
          referenceId: invoice.id,
          entryFor,
          entryForId,
          processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
          locationId: finalLocationId,
          partyLedgerAccountId: ledgerAccount.id,
        },
        transaction
      );
    }

    if (countyTaxAmount > 0 && ledgerAccountForCountyTax) {
      await journalEntryRepository.create(
        {
          amount: countyTaxAmount,
          ledgerId: ledgerAccountForCountyTax.id,
          type: JOURNAL_ENTRY_TYPE.CR,
          referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
          referenceId: invoice.id,
          entryFor,
          entryForId,
          processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
          locationId: finalLocationId,
          partyLedgerAccountId: ledgerAccount.id,
        },
        transaction
      );
    }

    // 5. CR Finished Goods & DR COGS for Slabs
    const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      clientId,
    }, transaction);

    const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
      clientId,
    }, transaction);

    for (const salesOrderProduct of selectedProducts) {
      await inventoryProductRepository.updateInventoryProductStatusById(
        salesOrderProduct.inventoryProductId,
        INVENTORY_ITEM_STATUS.SOLD,
        transaction
      );

      await salesOrderProductRepository.updateSalesOrderProduct(
        salesOrderProduct.id,
        {
          salesOrderInvoiceId: invoice.id,
          stage: SALE_ORDER_PRODUCT_STAGES.INVOICED,
          picked: true,
          soDiscountPercentage: Number((salesOrderProduct as any).soDiscountPercentage ?? salesOrder.discountPercentage) || 0,
        },
        transaction
      );

      if (salesOrderProduct?.inventoryProduct?.isSlabType && salesOrderProduct.inventoryProduct?.slab && ledgerAccountForFinishedGoods && ledgerAccountForCogs) {
        const prodEntryFor = salesOrderProduct.loadingOrderId ? JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER : JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST;
        const prodEntryForId = salesOrderProduct.loadingOrderId || salesOrderProduct.packagingListId || entryForId;

        await journalEntryRepository.create(
          {
            amount: salesOrderProduct.inventoryProduct.assetValue,
            ledgerId: ledgerAccountForFinishedGoods.id,
            type: JOURNAL_ENTRY_TYPE.CR,
            subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
            subReferenceId: salesOrderProduct.inventoryProduct.slab.id,
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
            referenceId: invoice.id,
            processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
            entryFor: prodEntryFor,
            entryForId: prodEntryForId,
            locationId: finalLocationId,
            partyLedgerAccountId: ledgerAccountForCogs.id,
          },
          transaction
        );

        await journalEntryRepository.create(
          {
            amount: salesOrderProduct.inventoryProduct.assetValue,
            ledgerId: ledgerAccountForCogs.id,
            type: JOURNAL_ENTRY_TYPE.DR,
            subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
            subReferenceId: salesOrderProduct.inventoryProduct.slab.id,
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
            referenceId: invoice.id,
            processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
            entryFor: prodEntryFor,
            entryForId: prodEntryForId,
            locationId: finalLocationId,
            partyLedgerAccountId: ledgerAccountForFinishedGoods.id,
          },
          transaction
        );
      }
    }

    // 6. Check and update status of affected PLs and LOs
    for (const plId of affectedPlIds) {
      const remainingUninvoicedInPl = await scoped(models.SalesOrderProduct).count({
        where: {
          packagingListId: plId,
          salesOrderInvoiceId: null,
          stage: { [Op.ne]: SALE_ORDER_PRODUCT_STAGES.INVOICED },
        },
        transaction,
      });
      if (remainingUninvoicedInPl === 0) {
        await packagingListRepository.updatePackagingList(plId, { stage: PACKAGING_LIST_STAGES.INVOICED }, transaction);
      }
    }

    for (const loId of affectedLoIds) {
      const remainingUninvoicedInLo = await scoped(models.SalesOrderProduct).count({
        where: {
          loadingOrderId: loId,
          salesOrderInvoiceId: null,
          stage: { [Op.ne]: SALE_ORDER_PRODUCT_STAGES.INVOICED },
        },
        transaction,
      });
      if (remainingUninvoicedInLo === 0) {
        await loadingOrderRepository.updateLoadingOrder(loId, { invoiced: true }, transaction);
      }
    }

    // 7. Create Journal Entries for Trade Services on Invoice (if any services passed)
    if (Array.isArray(data.services) && data.services.length) {
      for (const serviceItem of data.services) {
        const serviceRecord: any = await models.Service.findByPk(serviceItem.serviceId, { transaction });
        const serviceAmount =
          serviceItem.chargeType === "fixed"
            ? Number(serviceItem.price || 0)
            : Number(serviceItem.price || 0) * (Number(serviceItem.quantity) || 1);

        if (serviceRecord?.ledgerAccountId && serviceAmount > 0) {
          // CR Service Revenue Account
          await journalEntryRepository.create(
            {
              amount: serviceAmount,
              ledgerId: serviceRecord.ledgerAccountId,
              type: JOURNAL_ENTRY_TYPE.CR,
              processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
              referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
              referenceId: invoice.id,
              entryFor,
              entryForId,
              locationId: finalLocationId,
              partyLedgerAccountId: ledgerAccount.id,
            },
            transaction
          );

          // DR Customer Account
          await journalEntryRepository.create(
            {
              amount: serviceAmount,
              ledgerId: ledgerAccount.id,
              type: JOURNAL_ENTRY_TYPE.DR,
              processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
              referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
              referenceId: invoice.id,
              entryFor,
              entryForId,
              locationId: finalLocationId,
              partyLedgerAccountId: serviceRecord.ledgerAccountId,
            },
            transaction
          );
        }
      }
    }

    // 8. Log activity
    await activityService.logActivity(
      {
        clientId,
        activityType: ACTIVITY_TYPE.SALES_INVOICE_CREATION,
        referenceId: invoice.id,
        referenceType: ACTIVITY_REFERENCE_TYPE.SALES_INVOICE,
        title: "Sales Invoice Created",
        description: `Sales Invoice #${invoice.invoiceCode || invoice.id} was created directly from Sales Order #${salesOrder.code || salesOrder.id}.`,
        locationId: finalLocationId,
      },
      transaction
    );

    // 9. Auto-settle advanced deposits
    const autoSettlements = await packagingListService.autoSettleAdvancedDeposits(
      salesOrder.id,
      invoice.id,
      Number(invoice.finalAmount),
      transaction
    );

    await transaction.commit();
    return { invoice, autoSettlements };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
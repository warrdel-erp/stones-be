import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as packagingListRepository from "../repositories/packagingList.repository";
import { PACKAGING_LIST_STAGES, SALE_ORDER_PRODUCT_STAGES, LEDGER_ACCOUNT_REFERENCE_TYPES, JOURNAL_ENTRY_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_FOR_TYPES, JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_SUB_REFERENCE_TYPES, ACTIVITY_TYPE, ACTIVITY_REFERENCE_TYPE } from "../constants/tableTypes";
import { INVENTORY_ITEM_STATUS } from "../constants";
import Decimal from 'decimal.js';
import * as decimal from '../helper/decimal';
import * as models from '../models';
import { scoped } from '../utils/scoped';
import { sequelize } from "../config/database";
import { Op } from "sequelize";
import { DELIVERY_STATUS } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import { removeDuplicatesWithUnitPrice, getPercentageValue } from "../helper";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";
import { getTotalLoOrderQuantity, getTotalPlAmount } from "./packagingList.service";
import _ from "lodash";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as packagingListService from "../services/packagingList.service";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as activityService from "../services/activity.service";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";

// Create new PL
export const createLoadingOrder = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    if (!data?.soProducts || !Array.isArray(data.soProducts) || data.soProducts.length === 0) {
      throw new AppError("SO products are required.", 400);
    }

    if (!data?.salesOrderId) {
      throw new AppError("Sales order ID is required.", 400);
    }

        // Determine the distinct packaging lists involved.
    const packagingListIds = new Set<number>();
    
    // Ensure products are not assigned to a delivery
    const sopIds = data.soProducts.map((p: any) => p.id);
    const existingDeliveryItems = await sequelize.models.DeliveryItem.findAll({
      where: { salesOrderProductId: { [Op.in]: sopIds } },
      include: [{
        association: 'delivery',
        where: { status: { [Op.ne]: 'rejected' } } // Fallback hardcoded string since DELIVERY_STATUS might not be imported correctly if I messed up
      }],
      transaction
    });
    
    if (existingDeliveryItems && existingDeliveryItems.length > 0) {
      const conflictSopId = (existingDeliveryItems[0] as any).salesOrderProductId;
      throw new AppError(`Product ${conflictSopId} is already assigned to a delivery and cannot be added to a loading order.`, 400);
    }

    // Check concurrency and ensure none of the selected products already have a loadingOrderId
    for (const product of data.soProducts) {
      const existingProduct = await salesOrderProductRepository.findByIdSimple(product.id, transaction);
      if (existingProduct.loadingOrderId) {
        throw new AppError(`Product ${product.id} is already assigned to a loading order.`, 400);
      }
      if (existingProduct.packagingListId) {
        packagingListIds.add(existingProduct.packagingListId);
      }
    }

    let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(
      { ...data, salesOrderId: data.salesOrderId },
      transaction
    );
    loadingOrder = loadingOrder.get({ plain: true });

    const productsToUpdate = data.soProducts.map((e: any) => ({
      ...e,
      loadingOrderId: loadingOrder.id,
      stage: SALE_ORDER_PRODUCT_STAGES.LOADING_ORDER,
    }));

    const updatedProducts = await salesOrderProductService.updateSalesOrderProducts(
      productsToUpdate,
      transaction
    );

    // Update stages of all involved packaging lists
    for (const plId of packagingListIds) {
      const allPlProducts = await salesOrderProductRepository.getSalesOrderProductsByPackagingListId(plId, transaction);
      // Calculate how many products are still unassigned in this PL
      // Unassigned = no loadingOrderId and not in current productsToUpdate
      const unassignedCount = allPlProducts.filter((p: any) => !p.loadingOrderId && !data.soProducts.find((u: any) => Number(u.id) === Number(p.id))).length;

      const newStage = unassignedCount > 0
        ? PACKAGING_LIST_STAGES.PARTIAL_LOADING_ORDER
        : PACKAGING_LIST_STAGES.LOADING_ORDER;

      await packagingListRepository.updatePackagingList(
        plId,
        { stage: newStage },
        transaction
      );
    }

    transaction.commit();
    return { loadingOrder, updatedProducts };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Get all PL
export const getAllLoadingOrders = async () => {
  return await loadingOrderRepository.getAllLoadingOrders();
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await loadingOrderRepository.getLoadingOrderById(id);

  if (!loadingOrder) {
    throw new AppError("Invalid Id", 400);
  }

  loadingOrder.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(loadingOrder.salesOrderProducts);

  // Calculations for loading order.
  loadingOrder.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(loadingOrder.salesOrderProducts);

  // get payment terms constant data.
  if (loadingOrder.packagingList) {
    loadingOrder.packagingList.paymentTerms = PAYMENT_TERMS.find((e) => e.id == loadingOrder.packagingList.paymentTerms);
    if (loadingOrder.packagingList.salesOrder?.customer) {
      loadingOrder.packagingList.salesOrder.customer.salesTax = SALES_TAX.find(
        (e) => e.id == loadingOrder.packagingList.salesOrder.customer.salesTax
      );
    }
  }

  if (loadingOrder.salesOrder?.customer) {
    loadingOrder.salesOrder.customer.salesTax = SALES_TAX.find(
      (e) => e.id == loadingOrder.salesOrder.customer.salesTax
    );
  }

  delete loadingOrder.salesOrderProducts;

  return loadingOrder;
};


// Get loading order by PL id
export const getLoadingOrdersBySalesOrderId = async (loadingOrderId: number) => {
  return await loadingOrderRepository.getLoadingOrdersBySalesOrderId(loadingOrderId);
};

// Update loading order
export const updateLoadingOrder = async (id: number, data: any) => {
  return await loadingOrderRepository.updateLoadingOrder(id, data);
};

// Get new LO number
export const getPLNumber = async (clientId: number, salesOrderId?: number) => {
  return await loadingOrderRepository.getPlNumber(clientId, salesOrderId);
};
export const invoiceLoadingOrder = async (id: number, clientId: number, locationId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const loadingOrder: any = await getLoadingOrderById(Number(id));

    if (!loadingOrder) {
      throw new AppError(`Loading order does not exist with given id: ${id}`, 400);
    }

    if (loadingOrder.invoiced) {
      throw new AppError("Cannot invoice Loading Order as it is already invoiced.", 400);
    }

    if (!loadingOrder.products?.length) {
      throw new AppError(`Loading order with id: ${id} does not have any product added. So it can't be invoiced`, 400);
    }

    const invoiceAmountObj = loadingOrder.calculations.loadingOrder;
    let serviceTotals = 0; // if you have tradeServices on LO, calculate here, else 0

    const actualSalesOrder = loadingOrder.packagingList?.salesOrder || loadingOrder.salesOrder;

    // create invoice
    const invoice: any = await soInvoiceRepository.createInvoice(
      {
        clientId: clientId,
        customerId: actualSalesOrder.customerId,
        loadingOrderId: loadingOrder.id,
        amount: invoiceAmountObj.subTotal,
        taxableAmount: invoiceAmountObj.taxable,
        taxValue: invoiceAmountObj.tax,
        totalServiceCharges: serviceTotals,
        salesOrderId: loadingOrder.salesOrderId,
      },
      transaction
    );

    // Create Journal Entry for Invoice START
    const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      referenceId: actualSalesOrder.customerId,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    });

    const ledgerAccountForGoodsSold: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      clientId,
    });

    const customerTax = actualSalesOrder.tax || 0;

    // Journal Entry for with tax.
    await journalEntryRepository.create(
      {
        amount: invoiceAmountObj.total,
        ledgerId: ledgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.DR,

        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
        entryForId: loadingOrder.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId,
        partyLedgerAccountId: ledgerAccountForGoodsSold.id,
      },
      transaction
    );

    // Journal Entry for Without tax.
    await journalEntryRepository.create(
      {
        amount: invoice.amount,
        ledgerId: ledgerAccountForGoodsSold.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
        entryForId: loadingOrder.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    const ledgerAccountForStateTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
      clientId,
    });

    const ledgerAccountForCountyTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
      clientId,
    });

    await journalEntryRepository.create(
      {
        amount: getPercentageValue(invoiceAmountObj.taxable, customerTax?.stateTax || 0),
        ledgerId: ledgerAccountForStateTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
        entryForId: loadingOrder.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    const countyTax = customerTax ? customerTax.value - customerTax?.stateTax : 0;
    await journalEntryRepository.create(
      {
        amount: getPercentageValue(invoiceAmountObj.taxable, countyTax),
        ledgerId: ledgerAccountForCountyTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
        referenceId: invoice.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
        entryForId: loadingOrder.id,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      clientId,
    });

    const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
      clientId,
    });

    // Mark corresponding products as SOLD
    const rawProducts = await salesOrderProductRepository.getSalesOrderProductsBySalesOrderId(loadingOrder.salesOrderId);
    const loProducts = rawProducts.filter((p: any) => p.loadingOrderId === loadingOrder.id);

    for (const salesOrderProduct of loProducts) {
      await inventoryProductRepository.updateInventoryProductStatusById(
        salesOrderProduct.inventoryProductId,
        INVENTORY_ITEM_STATUS.SOLD,
        transaction
      );

      await salesOrderProductRepository.updateSalesOrderProduct(
        salesOrderProduct.id,
        { stage: SALE_ORDER_PRODUCT_STAGES.INVOICED, picked: true },
        transaction
      );

      if (salesOrderProduct?.inventoryProduct?.isSlabType) {
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
            entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
            entryForId: loadingOrder.id,
            locationId,
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
            entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
            entryForId: loadingOrder.id,
            locationId,
            partyLedgerAccountId: ledgerAccountForFinishedGoods.id,
          },
          transaction
        );
      }
    }

    await loadingOrderRepository.updateLoadingOrder(
      loadingOrder.id,
      { invoiced: true },
      transaction
    );

    await activityService.logActivity(
      {
        clientId: clientId,
        activityType: ACTIVITY_TYPE.SALES_INVOICE_CREATION,
        referenceId: invoice.id,
        referenceType: ACTIVITY_REFERENCE_TYPE.SALES_INVOICE,
        title: "Sales Invoice Created",
        description: `Sales Invoice #${invoice.invoiceCode || invoice.id} was created for Loading Order #${loadingOrder.code}.`,
        locationId,
      },
      transaction
    );

    const autoSettlements = await packagingListService.autoSettleAdvancedDeposits(
      loadingOrder.salesOrderId,
      invoice.id,
      Number(invoice.finalAmount),
      transaction
    );

    transaction.commit();
    return { loadingOrder, invoice, autoSettlements };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};



export const getInvoicePreview = async (loadingOrderId: number) => {
  const loadingOrder: any = await loadingOrderRepository.getLoadingOrderById(Number(loadingOrderId));

  if (!loadingOrder) {
    throw new AppError(`Loading Order not found with id: ${loadingOrderId}`, 400);
  }

  if (loadingOrder.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError('Loading Order is already invoiced.', 400);
  }

  const invoiceAmountObj = loadingOrder.calculations.loadingOrder;
  let serviceTotals = 0; // if you have tradeServices on LO, calculate here, else 0

  const actualSalesOrder = loadingOrder.packagingList?.salesOrder || loadingOrder.salesOrder;
  const invoiceTotal = decimal.decimalAdd(invoiceAmountObj.total, serviceTotals);

  const salesOrderId = actualSalesOrder.id;
  const deposits: any[] = await scoped(models.AdvancedDeposit).findAll({
    where: { salesOrderId },
    order: [['createdAt', 'ASC']],
    include: [
      {
        association: 'settlements',
        attributes: ['amount'],
      }
    ],
  });

  let remainingInvoiceBalance = new Decimal(invoiceTotal);
  const depositPreviews: Array<{
    depositId: number;
    depositCode: string;
    depositAmount: number;
    alreadySettled: number;
    availableBalance: number;
    willBeSettled: number;
  }> = [];

  for (const dep of deposits) {
    if (remainingInvoiceBalance.lte(0)) break;

    const depAmount = new Decimal(dep.amount);
    let settledSoFar = new Decimal(0);
    if (dep.settlements && dep.settlements.length > 0) {
      settledSoFar = dep.settlements.reduce(
        (sum: Decimal, s: any) => sum.plus(new Decimal(s.amount)),
        new Decimal(0)
      );
    }
    const available = depAmount.minus(settledSoFar);

    if (available.gt(0)) {
      let settlementAmount = new Decimal(0);
      if (available.gte(remainingInvoiceBalance)) {
        settlementAmount = remainingInvoiceBalance;
        remainingInvoiceBalance = new Decimal(0);
      } else {
        settlementAmount = available;
        remainingInvoiceBalance = remainingInvoiceBalance.minus(available);
      }

      depositPreviews.push({
        depositId: dep.id as number,
        depositCode: dep.code,
        depositAmount: depAmount.toNumber(),
        alreadySettled: settledSoFar.toNumber(),
        availableBalance: available.toNumber(),
        willBeSettled: settlementAmount.toNumber(),
      });
    }
  }

  const totalWillBeSettled = depositPreviews.reduce((sum, d) => sum + d.willBeSettled, 0);

  return {
    invoiceSummary: {
      subTotal: invoiceAmountObj.subTotal,
      taxable: invoiceAmountObj.taxable,
      tax: invoiceAmountObj.tax,
      serviceCharges: serviceTotals,
      total: invoiceTotal,
    },
    depositPreviews,
    totalWillBeSettled,
    remainingDueAfterSettlement: remainingInvoiceBalance.toNumber(),
  };
};

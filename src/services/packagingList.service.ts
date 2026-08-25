import { INVENTORY_ITEM_STATUS, PAYMENT_TERMS, SALES_TAX } from "../constants";
import { AppError } from "../helper/appError";
import * as notesRepository from "../repositories/notes.repository";

import _ from "lodash";
import { Transaction, WhereOptions, Op } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";

import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import * as deliveryRepository from "../repositories/delivery.repository";
import * as packagingListService from "../services/packagingList.service";
import * as salesOrderService from "../services/salesOrder.service";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as tradeServiceService from '../services/tradeService.service';
import * as decimal from '../helper/decimal'

import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import {
  DELIVERY_STATUS,
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  PACKAGING_LIST_STAGES,
  NOTES_REFERENCE_TYPES,
  NOTES_TYPE,
  SALE_ORDER_PRODUCT_STAGES,
  ACTIVITY_TYPE,
  ACTIVITY_REFERENCE_TYPE,
} from "../constants/tableTypes";
import * as activityService from "../services/activity.service";
import { getPercentageValue, removeDuplicatesWithUnitPrice, sumDecimal } from "../helper";
import { Return } from "../models";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import { createJournalEntriesForTradeServicesOfPackagingList } from "./journalEntry.service";
import * as salesOrderInvoiceService from "./salesOrderInvoice.service";
import * as advancedDepositService from "./advancedDeposit.service";
import Decimal from "decimal.js";
import { scoped } from "../utils/scoped";

// Create new LO
export const createPackagingList = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {

    const { salesOrderId } = await salesOrderProductService.validateSalesOrderProducts(data.soProducts);

    let packagingList: any = await packagingListRepository.createPackagingList({ ...data, salesOrderId }, transaction);

    packagingList = packagingList.get({ plain: true });

    // Create trade services for packaging list if it exists
    // -------------------- 
    if (Array.isArray(data.services) && data.services.length) {
      await tradeServiceService.createMultipleTradeServices(
        data.services,
        TRADE_SERVICE_REFERENCE_TYPES.PACKAGING_LIST,
        packagingList.id,
        data.clientId,
        "sale",
        transaction
      );
    }

    // -------------------- 

    let updatedProducts = [];

    if (data?.soProducts) {
      // Set packagingListId, salesOrderId and stage to packagingList for each product
      const productsToUpdate = data.soProducts.map((e: any) => ({
        ...e,
        packagingListId: packagingList.id,
        stage: SALE_ORDER_PRODUCT_STAGES.PACKAGING_LIST,
      }));

      updatedProducts = await salesOrderProductService.updateSalesOrderProducts(
        productsToUpdate,
        transaction
      );
    } else {
      throw new AppError("SO products are required.", 400);
    }

    // Create internal note (if provided)
    const { internalNote, printableNote } = await createLONotes(data, packagingList, transaction);

    transaction.commit();
    return { ...packagingList, products: updatedProducts, internalNote, printableNote };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Get all LO
export const getAllPackagingLists = async (page: number, limit: number, clientId: number, filters?: any) => {
  const data = await packagingListRepository.getAllPackagingLists(page, limit, clientId, filters);

  data.data = data.data.map((packagingList: any) => {
    packagingList = packagingList.get({ plain: true });

    // Filter invoiceDeliveries to exclude those with rejected deliveries
    // if (packagingList.invoiceDeliveries) {
    //   packagingList.invoiceDeliveries = packagingList.invoiceDeliveries.filter((invoiceDelivery: any) => {
    //     // Keep invoiceDelivery if it doesn't have a delivery, or if delivery status is not rejected
    //     return !invoiceDelivery.delivery || invoiceDelivery.delivery.status !== DELIVERY_STATUS.REJECTED;
    //   });
    // }

    const calcs = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);

    if (packagingList.loadingOrder) {
      packagingList.loAmounts = calcs.loadingOrder
    } else {
      packagingList.amounts = calcs.packagingList;
    }

    packagingList.quantities = calcs.quantities

    return packagingList;
  }) as any;

  return data;
};

// Get all PL without pagination.
export const getAllPackagingListsWithoutPagination = async (filters: WhereOptions) => {
  let loadingOrders = await packagingListRepository.getAllPackagingListsWithoutPagination(filters);

  // get total amount of all LOs'
  loadingOrders = packagingListWithTotalAmount(loadingOrders);

  return loadingOrders;
};

// Get packaging list by Id
export const getPackagingListById = async (id: number) => {
  const packagingList = await packagingListRepository.getPackagingListById(id);

  packagingList.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);

  // so product as per product and unitPrice.
  packagingList.products = getNestedSalesOrderProductAccordingToIdAndUnitPrice(packagingList.salesOrderProducts);

  return packagingList;
};

// Get packaging list with salesOrderProducts, which are available for return as per returnId.
export const getPackagingListAsPerReturn = async (returnId: number) => {
  const returnData = (await Return.findByPk(returnId, {
    include: [
      {
        association: 'soInvoice'
      }
    ]
  }))?.get({ plain: true })

  if (!returnData) {
    throw new AppError('Return does not exists.', 400);
  }

  // this packaging list does have only return products that belong to given returnId
  const packagingListId = returnData.soInvoice?.packagingListId;
  if (!packagingListId) {
    throw new AppError('Packaging List ID not found on the associated invoice.', 400);
  }

  const packagingList = await packagingListRepository.getPackagingListAsPerReturn(packagingListId, returnId);

  if (!packagingList) {
    throw new AppError('Packaging List does not exists.', 400);
  }

  // these are product for an invoice that are available for invoicing
  // const soProductsAvailableToReturnAsPerInvoice = await salesOrderInvoiceService.getSalesOrderProductsWithoutReturns(packagingList.salesOrderInvoice.id)

  // packagingList.salesOrderProducts.push(...(soProductsAvailableToReturnAsPerInvoice.map(e => e.get({ plain: true }))))

  // Calculate total amount added in SO.
  packagingList.amounts = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);

  // so product as per product and unitPrice.
  packagingList.products = getNestedSalesOrderProductAccordingToIdAndUnitPrice(packagingList?.salesOrderProducts);


  return { ...packagingList, returnData };
};

// Get packaging list by Id
export const getPackagingListOnlyAsPerReturn = async (returnId: number) => {
  const returnData = (await Return.findByPk(returnId, {
    include: [
      {
        association: 'soInvoice'
      },
    ]
  }))?.get({ plain: true })

  if (!returnData) {
    throw new AppError('Return does not exists.', 400);
  }

  // this packaging list does have only return products that belong to given returnId
  const packagingListId = returnData.soInvoice?.packagingListId;
  if (!packagingListId) {
    throw new AppError('Packaging List ID not found on the associated invoice.', 400);
  }

  const packagingList = await packagingListRepository.getPackagingListAsPerReturn(packagingListId, returnId);

  if (!packagingList) {
    throw new AppError('Packaging List does not exists.', 400);
  }

  // Calculate total amount added in SO.
  packagingList.amounts = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);


  // so product as per product and unitPrice.
  packagingList.products = getNestedSalesOrderProductAccordingToIdAndUnitPrice(packagingList?.salesOrderProducts);

  // get payment terms constant data.


  return { ...packagingList, returnData };
};


async function createLONotes(data: any, packagingList: any, transaction: Transaction) {
  let internalNote: any = null;
  if (data?.internalNote) {
    internalNote = await notesRepository.createNote(
      {
        description: data?.internalNote,
        type: NOTES_TYPE.INTERNAL,
        referenceType: NOTES_REFERENCE_TYPES.PACKAGING_LIST,
        referenceId: packagingList?.id,
      },
      transaction
    );
  }

  // Create printable note (if provided)
  let printableNote: any = null;
  if (data?.printableNote) {
    printableNote = await notesRepository.createNote(
      {
        description: data?.printableNote,
        type: NOTES_TYPE.INTERNAL,
        referenceType: NOTES_REFERENCE_TYPES.PACKAGING_LIST,
        referenceId: packagingList?.id,
      },
      transaction
    );
  }
  return { internalNote, printableNote };
}

export function getTotalPackagingListAmount(salesOrderProducts: any[], tax: number) {
  let totalAmount = 0;
  let taxableAmount = 0;

  for (const salesOrderProduct of salesOrderProducts) {
    // Calculate total amount.
    if (salesOrderProduct?.inventoryProduct?.slab) {
      totalAmount += (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth * salesOrderProduct.unitPrice) / 144;
    } else {
      totalAmount += Number(salesOrderProduct.unitPrice);
    }

    // Calculate Total Amount
    if (salesOrderProduct.taxApplied) {
      if (salesOrderProduct?.inventoryProduct?.slab) {
        taxableAmount += (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth * salesOrderProduct.unitPrice) / 144;
      } else {
        taxableAmount += Number(salesOrderProduct.unitPrice);
      }
    }
  }

  const taxAmount = getPercentageValue(taxableAmount, tax)

  return {
    totalAmount,
    taxableAmount,
    taxAmount,
  }
}

export function getTotalLOQuantity(salesOrderProducts: any[], isSlabType: boolean) {
  if (isSlabType) {
    return _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) => (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth) / 144
    );
  }

  return salesOrderProducts.length;
}

export function getTotalLoOrderQuantity(salesOrderProducts: any[], isSlabType: boolean) {
  if (!isSlabType) {
    return salesOrderProducts.length;
  } else {
    return _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) => {
        if (salesOrderProduct?.inventoryProduct?.slab) {
          return (salesOrderProduct.inventoryProduct.slab.receivingLength *
            salesOrderProduct.inventoryProduct.slab.receivingWidth) /
            144
        } else {
          return salesOrderProduct.unitPrice;
        }
      }
    );
  }
}

export function getTotalPlAmount(salesOrderProducts: any[], tax: number) {
  let totalAmount = 0;

  for (const salesOrderProduct of salesOrderProducts) {
    if (salesOrderProduct.inventoryProduct.slab) {
      totalAmount += (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth * salesOrderProduct.unitPrice) / 144;
    } else {
      totalAmount += Number(salesOrderProduct.unitPrice);
    }
  }

  let taxableAmount = 0;
  for (const salesOrderProduct of salesOrderProducts) {
    if (salesOrderProduct.taxApplied) {
      if (salesOrderProduct.inventoryProduct.slab) {
        taxableAmount += (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth * salesOrderProduct.unitPrice) / 144;
      } else {
        taxableAmount += Number(salesOrderProduct.unitPrice);
      }
    }
  }
  const taxAmount = getPercentageValue(taxableAmount, tax)

  return {
    totalAmount,
    taxableAmount,
    taxAmount,
  }
}

export function getNestedSalesOrderProductAccordingToIdAndUnitPrice(salesOrderProducts: any[] = []) {

  const products = removeDuplicatesWithUnitPrice(
    salesOrderProducts.map((salesOrderProduct: any) => ({
      ...salesOrderProduct?.inventoryProduct?.product,
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const nestedProducts = products.map((product) => {

    const salesOrderProductsAsPerProduct = salesOrderProducts.filter(
      (salesOrderProduct: any) => {
        const productId = salesOrderProduct.inventoryProduct.productId;

        return (productId === product.id)
          &&
          (salesOrderProduct.unitPrice === product.unitPrice)
      }
    );

    const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(salesOrderProductsAsPerProduct);

    return {
      ...product,
      taxApplied: !!salesOrderProductsAsPerProduct[0]?.taxApplied,
      salesOrderProduct: salesOrderProductsAsPerProduct,
      calculations,
      totalQuantity: calculations.quantities.packagingList,
      totalOrderQuantity: calculations.quantities.receiving,
    };
  });

  return nestedProducts;
}

// Get packaging list by SO id
export const getPackagingListsBySalesOrderId = async (salesOrderId: number) => {
  return await packagingListRepository.getPackagingListsBySalesOrderId(salesOrderId);
};

// Update Packaging List
export const updatePackagingList = async (id: number, data: any) => {
  return await packagingListRepository.updatePackagingList(id, data);
};

// Invoice Packaging List
export const invoicePackagingList = async (id: number, clientId: number, locationId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const packagingList: any = await packagingListService.getPackagingListById(Number(id));

    if (!packagingList) {
      throw new AppError(`Loading order does not exists with given id: ${id}`, 400);
    }

    // Check if packaging list is invoiced then can't invoice it again.
    if (packagingList.stage == PACKAGING_LIST_STAGES.INVOICED) {
      throw new AppError("Cannot invoice Packaging List as it is already invoiced.", 400);
    }

    // If PL doesn't have any product.
    if (!packagingList?.salesOrderProducts?.length) {
      throw new AppError(`Loading order with id: ${id} does not have any product added. So it can't be invoiced`, 400);
    }

    const invoiceAmountObj = packagingList.loadingOrder ? packagingList.calculations.loadingOrder : packagingList.calculations.packagingList

    let serviceTotals = 0;

    if (packagingList?.tradeServices) {
      serviceTotals = decimal.decimalSum(packagingList.tradeServices.map((e: any) => e.total));
    }

    // create invoice
    const invoice: any = await soInvoiceRepository.createInvoice(
      {
        clientId: clientId,
        customerId: packagingList.salesOrder.customerId,
        packagingListId: packagingList.id,
        amount: invoiceAmountObj.subTotal,
        taxableAmount: invoiceAmountObj.taxable,
        taxValue: invoiceAmountObj.tax,
        totalServiceCharges: serviceTotals,
        salesOrderId: packagingList.salesOrder.id,
      },
      transaction
    );

    // Create Journal Entry for Invoice START
    const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      referenceId: packagingList.salesOrder.customerId,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    });

    // Get ledger account for goods sold.
    const ledgerAccountForGoodsSold: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      clientId,
    });

    const customerTax = packagingList.salesOrder.tax || 0;

    // -------- Journal entry for Services ------------
    const tradeServices = packagingList.tradeServices;

    // for (const tradeService of tradeServices) {

    //   // ----- Journal entry for Service -----
    //   await journalEntryRepository.create(
    //     {
    //       amount: tradeService.total,
    //       ledgerId: tradeService.service.ledgerAccountId,
    //       type: JOURNAL_ENTRY_TYPE.CR,

    //       // ----- Trade service reference -----
    //       subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.TRADE_SERVICE,
    //       subReferenceId: tradeService.id,

    //       // ----- Loading order invoice reference -----
    //       referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
    //       referenceId: invoice.id,

    //       // ----- Loading order entry for -----
    //       entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
    //       entryForId: packagingList.id,

    //       processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
    //       locationId,
    //       partyLedgerAccountId: ledgerAccount.id,
    //     },
    //     transaction
    //   );

    //   // ----- Journal entry for Service Party Ledger Account -----
    //   // await journalEntryRepository.create(
    //   //   {
    //   //     amount: tradeService.total,
    //   //     ledgerId: ledgerAccount.id,
    //   //     type: JOURNAL_ENTRY_TYPE.DR,

    //   //     // ----- Trade service reference -----
    //   //     subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.TRADE_SERVICE,
    //   //     subReferenceId: tradeService.id,

    //   //     // ----- Loading order invoice reference -----
    //   //     referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
    //   //     referenceId: invoice.id,

    //   //     // ----- Loading order entry for -----
    //   //     entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
    //   //     entryForId: packagingList.id,

    //   //     processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
    //   //     locationId,
    //   //     partyLedgerAccountId: tradeService.service.ledgerAccountId,
    //   //   },
    //   //   transaction
    //   // );

    // }

    // Journal Entry for with tax.
    await journalEntryRepository.create(
      {
        amount: invoiceAmountObj.total,
        ledgerId: ledgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.DR,

        // reference
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
        entryForId: packagingList.id,

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

        // reference
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
        entryForId: packagingList.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    // Get ledger account for State tax.
    const ledgerAccountForStateTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
      clientId,
    });

    // Get ledger account for State tax.
    const ledgerAccountForCountyTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
      clientId,
    });

    // Journal Entry for state tax.
    await journalEntryRepository.create(
      {
        amount: getPercentageValue(invoiceAmountObj.taxable, customerTax?.stateTax || 0),
        ledgerId: ledgerAccountForStateTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        // reference
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
        referenceId: invoice.id,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
        entryForId: packagingList.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );

    // Calculate county tax.
    const countyTax = customerTax ? customerTax.value - customerTax?.stateTax : 0;

    // Journal Entry for county tax.
    await journalEntryRepository.create(
      {
        amount: getPercentageValue(invoiceAmountObj.taxable, countyTax),
        ledgerId: ledgerAccountForCountyTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        // reference
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
        referenceId: invoice.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
        entryForId: packagingList.id,
        locationId,
        partyLedgerAccountId: ledgerAccount.id,
      },
      transaction
    );
    // Create Journal Entry for Invoice END

    // Get ledger account for finished goods.
    const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      clientId,
    });

    // Get ledger account for finished cogs.
    const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
      clientId,
    });

    // Mark corresponding products as SOLD
    for (const salesOrderProduct of packagingList.salesOrderProducts) {

      // Update inventory product status to SOLD
      await inventoryProductRepository.updateInventoryProductStatusById(
        salesOrderProduct.inventoryProductId,
        INVENTORY_ITEM_STATUS.SOLD,
        transaction
      );

      // Update stage to INVOICED in Sales Order Product.
      await salesOrderProductRepository.updateSalesOrderProduct(
        salesOrderProduct.id,
        { stage: SALE_ORDER_PRODUCT_STAGES.INVOICED, picked: true },
        transaction
      );

      // Create journal entries (only for slabs as they have landed unit cost)
      if (salesOrderProduct?.inventoryProduct?.isSlabType) {
        await journalEntryRepository.create(
          {
            amount: salesOrderProduct.inventoryProduct.assetValue,
            ledgerId: ledgerAccountForFinishedGoods.id,
            type: JOURNAL_ENTRY_TYPE.CR,

            subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
            subReferenceId: salesOrderProduct.inventoryProduct.slab.id,

            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
            referenceId: invoice.id,

            processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
            entryForId: packagingList.id,
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

            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
            referenceId: invoice.id,

            processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
            entryForId: packagingList.id,

            locationId,
            partyLedgerAccountId: ledgerAccountForFinishedGoods.id,
          },
          transaction
        );
      }
    }

    // if Packaging list exists then mark invoiced to loading order.
    if (packagingList.loadingOrder) {
      await loadingOrderRepository.updateLoadingOrder(
        packagingList.loadingOrder?.id,
        { invoiced: true },
        transaction
      );
    }

    // Update stage to INVOICED in Packaging List.
    await packagingListRepository.updatePackagingList(id, { stage: PACKAGING_LIST_STAGES.INVOICED }, transaction);

    // Create journal entries for trade services
    await createJournalEntriesForTradeServicesOfPackagingList(packagingList, locationId, transaction);

    await activityService.logActivity(
      {
        clientId: clientId,
        activityType: ACTIVITY_TYPE.SALES_INVOICE_CREATION,
        referenceId: invoice.id,
        referenceType: ACTIVITY_REFERENCE_TYPE.SALES_INVOICE,
        title: "Sales Invoice Created",
        description: `Sales Invoice #${invoice.invoiceCode || invoice.id} was created for Packaging List #${packagingList.clientPlNumber}.`,
        locationId,
      },
      transaction
    );

    // ---- Auto-settle any unsettled Advanced Deposits for this SO (FIFO) ----
    const autoSettlements = await autoSettleAdvancedDeposits(
      packagingList.salesOrder.id,
      invoice.id,
      Number(invoice.finalAmount),
      transaction
    );
    // ---- End auto-settle ----

    transaction.commit();
    return { packagingList, invoice, autoSettlements };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

/**
 * Auto-settle unsettled advanced deposits for a Sales Order against an invoice (FIFO).
 * Settles oldest deposits first. Each settlement is min(remaining deposit balance, remaining invoice balance).
 * Returns an array of settlement summaries.
 */
async function autoSettleAdvancedDeposits(
  salesOrderId: number,
  invoiceId: number,
  invoiceFinalAmount: number,
  transaction: any
): Promise<Array<{ depositId: number; depositCode: string; settledAmount: number }>> {
  // Get all deposits for this SO in creation order (FIFO)
  const deposits: any[] = await scoped(models.AdvancedDeposit).findAll({
    where: { salesOrderId },
    order: [['createdAt', 'ASC']],
    include: [
      {
        association: 'settlements',
        attributes: ['amount'],
      }
    ],
    transaction,
  });

  let remainingInvoiceBalance = new Decimal(invoiceFinalAmount);
  const settlementResults: Array<{ depositId: number; depositCode: string; settledAmount: number }> = [];

  for (const deposit of deposits) {
    if (remainingInvoiceBalance.lte(0)) break;

    const depositAmount = new Decimal(deposit.amount);
    const totalAlreadySettled = deposit.settlements?.reduce(
      (sum: Decimal, s: any) => sum.plus(new Decimal(s.amount)),
      new Decimal(0)
    ) ?? new Decimal(0);

    const remainingDepositBalance = depositAmount.minus(totalAlreadySettled);
    if (remainingDepositBalance.lte(0)) continue;

    // Settle min(remaining deposit balance, remaining invoice balance)
    const settleAmount = Decimal.min(remainingDepositBalance, remainingInvoiceBalance);

    await scoped(models.AdvancedDepositSettlement).create(
      {
        amount: settleAmount.toNumber(),
        soInvoiceId: invoiceId,
        advancedDepositId: deposit.id,
      },
      { transaction }
    );

    settlementResults.push({
      depositId: deposit.id,
      depositCode: deposit.code,
      settledAmount: settleAmount.toNumber(),
    });

    remainingInvoiceBalance = remainingInvoiceBalance.minus(settleAmount);
  }

  return settlementResults;
}

/**
 * Preview what would happen when invoicing a Packaging List:
 * returns invoice amount breakdown + which ADs would be auto-settled and for how much.
 */
export const getInvoicePreview = async (packagingListId: number) => {
  const packagingList: any = await packagingListService.getPackagingListById(Number(packagingListId));

  if (!packagingList) {
    throw new AppError(`Packaging List not found with id: ${packagingListId}`, 400);
  }

  if (packagingList.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError('Packaging List is already invoiced.', 400);
  }

  const invoiceAmountObj = packagingList.loadingOrder
    ? packagingList.calculations.loadingOrder
    : packagingList.calculations.packagingList;

  let serviceTotals = 0;
  if (packagingList.tradeServices?.length) {
    serviceTotals = decimal.decimalSum(packagingList.tradeServices.map((e: any) => e.total));
  }

  // finalAmount = total (with tax) + services
  const invoiceTotal = decimal.decimalAdd(invoiceAmountObj.total, serviceTotals);

  // Get deposits for this SO and compute what would be auto-settled
  const salesOrderId = packagingList.salesOrder.id;
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

  let totalWillBeSettled = 0;

  for (const deposit of deposits) {
    const depositAmount = new Decimal(deposit.amount);
    const totalAlreadySettled = deposit.settlements?.reduce(
      (sum: Decimal, s: any) => sum.plus(new Decimal(s.amount)),
      new Decimal(0)
    ) ?? new Decimal(0);

    const remainingDepositBalance = depositAmount.minus(totalAlreadySettled);
    if (remainingDepositBalance.lte(0)) {
      depositPreviews.push({
        depositId: deposit.id,
        depositCode: deposit.code,
        depositAmount: depositAmount.toNumber(),
        alreadySettled: totalAlreadySettled.toNumber(),
        availableBalance: 0,
        willBeSettled: 0,
      });
      continue;
    }

    const willSettle = remainingInvoiceBalance.lte(0)
      ? new Decimal(0)
      : Decimal.min(remainingDepositBalance, remainingInvoiceBalance);

    depositPreviews.push({
      depositId: deposit.id,
      depositCode: deposit.code,
      depositAmount: depositAmount.toNumber(),
      alreadySettled: totalAlreadySettled.toNumber(),
      availableBalance: remainingDepositBalance.toNumber(),
      willBeSettled: willSettle.toNumber(),
    });

    totalWillBeSettled = decimal.decimalAdd(totalWillBeSettled, willSettle.toNumber());
    remainingInvoiceBalance = remainingInvoiceBalance.minus(willSettle);
  }

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
    remainingDueAfterSettlement: decimal.decimalAdd(invoiceTotal, -totalWillBeSettled),
  };
};

export const checkIfPackagingListInvoiced = async (packagingListId: number, operation: string) => {
  const packagingList = (await packagingListRepository.getPackagingListByIdSimple(packagingListId))?.get({ plain: true });

  if (!packagingList) {
    throw new AppError("Packaging List not found", 404);
  }

  // Check if packaging list is invoiced then can't create loading order.
  if (packagingList.stage == PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError(`Cannot ${operation} for an invoiced Packaging List`, 400);
  }

  return packagingList;
};

// Get new PL number
export const getPLNumber = async (clientId: number, salesOrderId?: number) => {
  return await packagingListRepository.getPlNumber(clientId, salesOrderId);
};

function packagingListWithTotalAmount(loadingOrders: any) {
  return loadingOrders.map((packagingList: any) => {
    packagingList = packagingList.get({ plain: true });

    const salesTax = SALES_TAX.find(e => e.id == packagingList.salesOrder.customer.salesTax);

    if (!salesTax) {
      throw new AppError('Error in getting tax value', 400);
    }

    // Calculate total amount added in LO.
    packagingList.amounts = getTotalPackagingListAmount(packagingList.salesOrderProducts, salesTax?.value);

    return packagingList;
  });
}

// Helper to validate packaging list state for cancellation
const validatePackagingListForCancel = (packagingList: any) => {
  if (!packagingList) {
    throw new AppError("Packaging List not found", 404);
  }

  if (packagingList.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError("Cannot cancel an invoiced Packaging List.", 400);
  }

  if (packagingList.stage === PACKAGING_LIST_STAGES.CANCELED) {
    throw new AppError("Packaging List is already canceled.", 400);
  }
};

// Helper to check and validate active deliveries
const validateNoActiveDeliveries = async (packagingListId: number) => {
  const activeDeliveries = await deliveryRepository.findExistingInvoiceDeliveriesByPackagingListIds([packagingListId]);
  if (activeDeliveries && activeDeliveries.length > 0) {
    throw new AppError("Cannot cancel Packaging List because active deliveries are present.", 400);
  }
};

// Helper to update all packaging list related records to canceled
const performPackagingListCancelUpdates = async (id: number, transaction: Transaction) => {
  // Update Packaging List stage
  await packagingListRepository.updatePackagingList(id, { stage: PACKAGING_LIST_STAGES.CANCELED }, transaction);

  // Get associated sales order products
  const salesOrderProducts = await salesOrderProductRepository.getSalesOrderProductsByPackagingListId(id, transaction);

  // Update Sales Order Products stage and picked status
  await salesOrderProductRepository.updateSalesOrderProductsByPackagingListId(
    id,
    { stage: SALE_ORDER_PRODUCT_STAGES.CANCELED, picked: false },
    transaction
  );

  // Update Inventory Products status back to IN_INVENTORY
  const inventoryProductIds = salesOrderProducts.map((sop: any) => sop.inventoryProductId).filter(Boolean);
  if (inventoryProductIds.length > 0) {
    await inventoryProductRepository.updateInventoryProductStatusesByIds(
      inventoryProductIds,
      INVENTORY_ITEM_STATUS.IN_INVENTORY,
      transaction
    );
  }

  // Update Loading Order status to canceled
  await loadingOrderRepository.updateLoadingOrderByPackagingListId(
    id,
    { status: "canceled" },
    transaction
  );
};

// Cancel Packaging List
// Cancel Packaging List
export const cancelPackagingList = async (id: number) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Fetch simple packaging list
    const packagingList: any = await packagingListRepository.getPackagingListByIdSimple(id, transaction);

    // 2. State validation
    validatePackagingListForCancel(packagingList);

    // 3. Active deliveries check
    await validateNoActiveDeliveries(id);

    // 4. Update stages, statuses and revert allocations
    await performPackagingListCancelUpdates(id, transaction);

    const { clientId, locationId } = packagingList;

    // 5. Log activity
    await activityService.logActivity(
      {
        clientId,
        activityType: ACTIVITY_TYPE.PACKAGING_LIST_CANCELLATION,
        referenceId: id,
        referenceType: ACTIVITY_REFERENCE_TYPE.PACKAGING_LIST,
        title: "Packaging List Canceled",
        description: `Packaging List #${packagingList.clientPlNumber || packagingList.id} was canceled.`,
        locationId,
      },
      transaction
    );

    await transaction.commit();
    return { success: true, message: "Packaging List canceled successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

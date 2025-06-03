import { AppError } from "../helper/appError";
import { PAYMENT_TERMS, SALES_TAX, SLAB_STATUS } from "../constants";
import * as notesRepository from "../repositories/notes.repository";

import { sequelize } from "../config/database";
import { Transaction, WhereOptions } from "sequelize";
import _ from "lodash";

import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as salesOrderService from "../services/salesOrder.service";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as slabRepository from "../repositories/slab.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntryRepository from "../repositories/journalEntry.repository";

import {
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  LOADING_ORDER_STAGES,
  NOTES_REFERENCE_TYPES,
  NOTES_TYPE,
  SALE_ORDER_PRODUCT_STAGES,
} from "../constants/tableTypes";
import { addPercentage, getPercentageValue, removeDuplicatesWithUnitPrice } from "../helper";
import { JournalEntry } from "../models/journalEntry.model";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(data, transaction);
    loadingOrder = loadingOrder.get({ plain: true });

    let updatedProducts = [];

    if (data?.soProducts) {
      // Set loadingOrderId and stage to loadingOrder for each product.
      data.soProducts = data.soProducts.map((e: any) => ({
        ...e,
        loadingOrderId: loadingOrder.id,
        stage: SALE_ORDER_PRODUCT_STAGES.LOADING_ORDER,
      }));

      updatedProducts = await salesOrderProductService.upsertSalesOrderProducts(
        data.soProducts,
        data.salesOrderId,
        transaction
      );
    } else {
      throw new AppError("SO products are required.", 400);
    }

    // Create internal note (if provided)
    let { internalNote, printableNote } = await createLONotes(data, loadingOrder, transaction);

    transaction.commit();
    return { ...loadingOrder, products: updatedProducts, internalNote, printableNote };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Get all LO
export const getAllLoadingOrders = async (page: number, limit: number, clientId: number, filters?: any) => {
  const data = await loadingOrderRepository.getAllLoadingOrders(page, limit, clientId, filters);

  data.data = data.data.map((loadingOrder: any) => {
    loadingOrder = loadingOrder.get({ plain: true });

    if (loadingOrder.packagingList) {
      loadingOrder.totalAmount = getTotalPlAmount(loadingOrder.salesOrderProducts);
    } else {
      loadingOrder.totalAmount = getTotalSalesOrderProductsAmount(loadingOrder.salesOrderProducts);
    }

    return loadingOrder;
  }) as any;

  return data;
};

// Get all LO without pagination.
export const getAllLoadingOrdersWithoutPagination = async (filters: WhereOptions) => {
  let loadingOrders = await loadingOrderRepository.getAllLoadingOrdersWithoutPagination(filters);

  // get total amount of all LOs'
  loadingOrders = loadingOrderWithTotalAmount(loadingOrders);

  return loadingOrders;
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await loadingOrderRepository.getLoadingOrderById(id);

  // Calculate total amount added in SO.
  loadingOrder.totalAmount = getTotalSalesOrderProductsAmount(loadingOrder.salesOrderProducts);

  // Calculate total pl amount added in SO.
  loadingOrder.totalPlAmount = getTotalPlAmount(loadingOrder.salesOrderProducts);

  // so product as per product and unitPrice.
  loadingOrder.products = getLoadingOrderProductAccordingToIdAndUnitPrice(loadingOrder);

  // get payment terms constant data.
  loadingOrder.paymentTerms = PAYMENT_TERMS.find((e) => e.id == loadingOrder.paymentTerms);

  loadingOrder.salesOrder.customer.salesTax = SALES_TAX.find((e) => e.id == loadingOrder.salesOrder.customer.salesTax);

  return loadingOrder;
};

async function createLONotes(data: any, loadingOrder: any, transaction: Transaction) {
  let internalNote: any = null;
  if (data?.internalNote) {
    internalNote = await notesRepository.createNote(
      {
        description: data?.internalNote,
        type: NOTES_TYPE.INTERNAL,
        referenceType: NOTES_REFERENCE_TYPES.LOADING_ORDER,
        referenceId: loadingOrder?.id,
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
        referenceType: NOTES_REFERENCE_TYPES.LOADING_ORDER,
        referenceId: loadingOrder?.id,
      },
      transaction
    );
  }
  return { internalNote, printableNote };
}

export function getTotalSalesOrderProductsAmount(salesOrderProducts: any[]) {
  return _.sumBy(
    salesOrderProducts,
    (salesOrderProduct: any) =>
      (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth * salesOrderProduct.unitPrice) / 144
  );
}

export function getTotalLOQuantity(salesOrderProducts: any[]) {
  return _.sumBy(
    salesOrderProducts,
    (salesOrderProduct: any) => (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth) / 144
  );
}

export function getTotalLoOrderQuantity(salesOrderProducts: any[]) {
  return _.sumBy(
    salesOrderProducts,
    (salesOrderProduct: any) =>
      (salesOrderProduct.inventoryProduct.slab.receivingLength *
        salesOrderProduct.inventoryProduct.slab.receivingWidth) /
      144
  );
}

export function getTotalPlAmount(salesOrderProducts: any[]) {
  return _.sumBy(
    salesOrderProducts,
    (salesOrderProduct: any) =>
      (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth * salesOrderProduct.unitPrice) / 144
  );
}

export function getLoadingOrderProductAccordingToIdAndUnitPrice(loadingOrder: any) {
  let products = removeDuplicatesWithUnitPrice(
    loadingOrder?.salesOrderProducts.map((salesOrderProduct: any) => ({
      ...salesOrderProduct.inventoryProduct.slab.product,
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const newProducts = products.map((product) => {
    const salesOrderProduct = loadingOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.product.id === product.id &&
        salesOrderProduct.unitPrice === product.unitPrice
    );

    const soProductsWithProductAndUnitPrice = loadingOrder.salesOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.product.id === product.id &&
        salesOrderProduct.unitPrice === product.unitPrice
    );

    return {
      ...product,
      taxApplied: !!salesOrderProduct[0].taxApplied,
      salesOrderProduct,
      totalQuantity: getTotalLOQuantity(salesOrderProduct),
      totalOrderQuantity: getTotalLoOrderQuantity(salesOrderProduct),
      soQuantity: salesOrderService.getTotalQuantity(soProductsWithProductAndUnitPrice),
    };
  });

  return newProducts;
}

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await loadingOrderRepository.getLoadingOrdersBySalesOrderId(salesOrderId);
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any) => {
  return await loadingOrderRepository.updateLoadingOrder(id, data);
};

// Invoice Loading Order
export const invoiceLoadingOrder = async (id: number, clientId: number, locationId: number) => {
  const transaction = await sequelize.transaction();

  try {
    let loadingOrder: any = await loadingOrderService.getLoadingOrderById(Number(id));

    if (!loadingOrder) {
      throw new AppError(`Loading order does not exists with given id: ${id}`, 400);
    }

    // Check if loading order is invoiced then can't invoice it again.
    if (loadingOrder.stage == LOADING_ORDER_STAGES.INVOICED) {
      throw new AppError("Cannot invoice Loading Order as it is already invoiced.", 400);
    }

    // If LO doesn't have any product.
    if (!loadingOrder?.salesOrderProducts?.length) {
      throw new AppError(`Loading order with id: ${id} does not have any product added. So it can't be invoiced`, 400);
    }

    // create invoice
    const invoice: any = await soInvoiceRepository.createInvoice(
      {
        clientId: clientId,
        customerId: loadingOrder.salesOrder.customerId,
        loadingOrderId: loadingOrder.id,
        amount: loadingOrder.totalPlAmount || loadingOrder.totalAmount,
        salesOrderId: loadingOrder.salesOrder.id,
      },
      transaction
    );

    // Create Journal Entry for Invoice START
    const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      referenceId: loadingOrder.salesOrder.customerId,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    });

    // Get ledger account for goods sold.
    const ledgerAccountForGoodsSold: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      clientId,
    });

    const customerTax = SALES_TAX.find((e) => e.id == loadingOrder.salesOrder.customer.salesTax);

    // Journal Entry for with tax.
    await journalEntryRepository.create(
      {
        amount: addPercentage(invoice.amount, customerTax?.value || 0),
        ledgerId: ledgerAccount.id,
        type: JOURNAL_ENTRY_TYPE.DR,

        // reference
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

        // reference
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
        amount: getPercentageValue(invoice.amount, customerTax?.stateTax || 0),
        ledgerId: ledgerAccountForStateTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        // reference
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

    // Calculate county tax.
    const countyTax = customerTax?.value ? customerTax?.value - customerTax?.stateTax! : 0;

    // Journal Entry for county tax.
    await journalEntryRepository.create(
      {
        amount: getPercentageValue(invoice.amount, countyTax),
        ledgerId: ledgerAccountForCountyTax.id,
        type: JOURNAL_ENTRY_TYPE.CR,

        // reference
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
    // Create Journal Entry for Invoice END

    // Mark corresponding slabs as SOLD
    for (const salesOrderProduct of loadingOrder.salesOrderProducts) {
      // Update Slab status to SOLD in Slab table.
      await slabRepository.updateSlabStatusByInventoryProduct(
        salesOrderProduct.inventoryProductId,
        SLAB_STATUS.SOLD,
        transaction
      );

      // Update stage to INVOICED in Sales Order Product.
      await salesOrderProductRepository.updateSalesOrderProduct(
        salesOrderProduct.id,
        { stage: SALE_ORDER_PRODUCT_STAGES.INVOICED, picked: true },
        transaction
      );

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

      await journalEntryRepository.create(
        {
          amount:
            salesOrderProduct.inventoryProduct.slab.receivingLength *
            salesOrderProduct.inventoryProduct.slab.receivingLength *
            salesOrderProduct.inventoryProduct.slab.landedUnitCost,
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
          amount:
            salesOrderProduct.inventoryProduct.slab.receivingLength *
            salesOrderProduct.inventoryProduct.slab.receivingWidth *
            salesOrderProduct.inventoryProduct.slab.landedUnitCost,
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

    // if Packaging list exists then mark invoiced to packaging list.
    if (loadingOrder.packagingList) {
      await packagingListRepository.updatePackagingList(
        loadingOrder.packagingList?.id,
        { invoiced: true },
        transaction
      );
    }

    // Update stage to INVOICED in Loading Order.
    await loadingOrderRepository.updateLoadingOrder(id, { stage: LOADING_ORDER_STAGES.INVOICED }, transaction);

    transaction.commit();
    return { loadingOrder, invoice };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

export const checkIfLoadingOrderInvoiced = async (loadingOrderId: number, operation: string) => {
  const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(loadingOrderId))?.get({ plain: true });

  if (!loadingOrder) {
    throw new AppError("Loading Order not found", 404);
  }

  // Check if loading order is invoiced then can't create packaging list.
  if (loadingOrder.stage == LOADING_ORDER_STAGES.INVOICED) {
    throw new AppError(`Cannot ${operation} for an invoiced Loading Order`, 400);
  }

  return loadingOrder;
};

// Get new LO number
export const getLONumber = async (clientId: number) => {
  return await loadingOrderRepository.getLoNumber(clientId);
};

function loadingOrderWithTotalAmount(loadingOrders: any) {
  return loadingOrders.map((loadingOrder: any) => {
    loadingOrder = loadingOrder.get({ plain: true });

    // Calculate total amount added in LO.
    loadingOrder.totalAmount = getTotalSalesOrderProductsAmount(loadingOrder.salesOrderProducts);

    return loadingOrder;
  });
}

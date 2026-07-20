import { Transaction } from "sequelize";
import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES, DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import {
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  PAYMENT_BILL_REFERENCE_TYPES,
  CREDIT_DEBIT_NOTE_TYPES,
} from "../constants/tableTypes";
import { JournalEntry } from "../models/journalEntry.model";
import JournalEntryModel from "../models/journalEntry.model";

import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as purchaseOrderRepository from "../repositories/purchaseOrder.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabService from "../services/slab.service";
import * as siplService from "./sipl.service";
import { AppError } from "../helper/appError";
import * as tradeServiceRepository from "../repositories/tradeService.repository";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import * as packagingListRepository from "../repositories/packagingList.repository";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import * as decimal from '../helper/decimal'
import * as models from "../models";
import { scoped } from "../utils/scoped";


export const createJournalEntryForBill = async (
  freightBillData: any,
  transaction: Transaction,
  locationId: number,
  ledgerAccountId: number,
  // partyLedgerAccountId: number
) => {

  /**
   * Create journal entry for freight bill item.
   */
  const billJournalEntry = await journalEntryRepository.create(
    {
      amount: freightBillData.amount,
      ledgerId: ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.ADD_FREIGHT_BILL,

      // reference is the BILL.
      referenceId: freightBillData.id,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: freightBillData.referenceId,
      locationId,
      partyLedgerAccountId: null

    },
    transaction
  );

  return billJournalEntry
}

// Create journal entry for freight bill item.
export async function createJournalEntryForFreightBillItem(
  freightBillItemData: any,
  freightBillData: any,
  calculations: any,
  transaction: Transaction,
  locationId: number,
  partyLedgerAccountId: number
) {
  // Unit freight item cost (amount / total received area of all products in sipl).
  const unitFreightItemCost = freightBillItemData.amount / calculations.totalQuantity;

  const sipl: any = (await siplRepository.findSIPLById(freightBillData.referenceId, transaction))?.get({ plain: true });

  const freightItemEntryDataAsPerSiplProduct = sipl.siplProducts.map((siplProduct: any): JournalEntry => {
    return {
      amount: unitFreightItemCost * siplProduct.quantity,
      ledgerId: freightBillItemData.ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.ADD_FREIGHT_BILL,

      // Sub reference is the product.
      subReferenceId: siplProduct.id,
      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SIPL_PRODUCT,

      referenceId: freightBillData.id,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: freightBillData.referenceId,
      locationId,
      partyLedgerAccountId
    };
  });

  // Sequentially create journal entries for products
  for (const entry of freightItemEntryDataAsPerSiplProduct) {
    await journalEntryRepository.create(entry, transaction);
  }

  return {
    productJournalEntry: true,
  };
}

// Create journal entry for SIPL.
export async function createJournalEntryForSIPL(siplId: number, siplData: any, transaction: Transaction, locationId: number) {
  const calculations = await siplService.getSiplCalculations(siplId, transaction);
  const po = await purchaseOrderRepository.getPOWithVendorLedgerAccount(siplData.purchaseOrderId, transaction);

  // Get in_inventory ledger account id for products entry.
  const ledgerAccountForProducts: any = await ledgerAccountRepository.getLedgerAccountByFilter(
    {
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
      clientId: siplData.clientId,
    },
    transaction
  );

  const siplJournalEntry = await journalEntryRepository.create(
    {
      amount: calculations.totalAmount,
      ledgerId: po.supplier.ledgerAccount.id,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,

      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: siplId,
      locationId,
      partyLedgerAccountId: ledgerAccountForProducts.id
    },
    transaction
  );

  // Create Journal entry data.
  const arr: JournalEntry[] = calculations.dataAccordingToProduct.map((productCalc: any): JournalEntry => {
    return {
      amount: productCalc.totalPrice,
      ledgerId: ledgerAccountForProducts.id,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,

      // Sub reference is the product.
      subReferenceId: productCalc.product.id,
      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.PRODUCT,

      // reference is the SIPL.
      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: siplId,
      locationId,
      partyLedgerAccountId: po.supplier.ledgerAccount.id
    };
  });

  // Sequentially create journal entries for products
  for (const entry of arr) {
    await journalEntryRepository.create(entry, transaction);
  }

  return { siplJournalEntry, productJournalEntry: true };
}

// create journal entry for receive inventory.
export const createJournalEntryForReceiveInventory = async (
  siplId: number,
  clientId: number,
  transaction: Transaction,
  locationId: number
) => {
  const calculations = await siplService.getSiplCalculations(siplId, transaction);

  const siplData = (await siplRepository.findSIPLById(siplId, transaction))?.get({ plain: true });

  // Create Journal entry for slabs
  const ledgerAccountForSlabs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
  });

  const ledgerAccountForProducts: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
    clientId,
  });

  for (const productCalc of calculations.dataAccordingToProduct) {
    // Create journal entry for product.
    await journalEntryRepository.create(
      {
        amount: productCalc.totalPrice,
        ledgerId: ledgerAccountForProducts.id,
        type: JOURNAL_ENTRY_TYPE.CR,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,

        // Sub reference is the product.
        subReferenceId: productCalc.product.id,
        subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.PRODUCT,

        // reference is the SIPL.
        referenceId: siplId,
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

        entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
        entryForId: siplId,
        locationId,
        partyLedgerAccountId: ledgerAccountForSlabs.id
      },
      transaction
    );

    // Create journal entry for freight bill item.
    for (const bill of siplData.bills) {
      for (const billItem of bill.billItems) {
        // Unit freight item cost based on total packaging area — consistent with DR side
        // which uses packagedSqrFt × landedUnitCost (landedUnitCost already includes freight).
        const unitFreightItemCost = decimal.decimalDivide(billItem.amount, calculations.totalPackagingArea);

        await journalEntryRepository.create({
          amount: decimal.decimalMultiply(unitFreightItemCost, productCalc.totalPackagingArea),
          ledgerId: billItem.ledgerAccountId,
          type: JOURNAL_ENTRY_TYPE.CR,
          processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,

          // Sub reference is the bill item.
          subReferenceId: billItem.id,
          subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.BILL_ITEM,

          // reference is the SIPL.
          referenceId: bill.referenceId,
          referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

          entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
          entryForId: siplId,
          locationId,
          partyLedgerAccountId: ledgerAccountForSlabs.id
        }, transaction);
      }
    }
  }

  for (const productCalc of calculations.dataAccordingToProduct) {
    const slabs = await slabService.fetchAllSlabs({ siplId, productId: productCalc.product.id }, transaction);

    for (let slab of slabs) {
      slab = slab.get ? (slab.get({ plain: true }) as any) : (slab as any);
      const slabAny: any = slab;
      const amount = slabAny.inventoryProduct?.assetValue || decimal.decimalMultiply(slabAny.packagedSqrFt, productCalc.landedUnitCost);

      await journalEntryRepository.create({
        amount,
        ledgerId: ledgerAccountForSlabs.id,
        type: JOURNAL_ENTRY_TYPE.DR,
        processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,
        subReferenceId: slabAny.id,
        subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
        referenceId: siplId,
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
        entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
        entryForId: siplId,
        locationId,
        partyLedgerAccountId: ledgerAccountForProducts.id,
      }, transaction);
    }
  }

  // Journal entry for Services.
  await createJournalEntriesForTradeServicesOfSIPL(siplData, locationId, transaction)

  // Balance inventory variance for SIPL
  await balanceInventoryVarianceForSIPL(siplId, clientId, locationId, transaction);

};

/**
 * Create journal entries for slab split
 * Creates a CR entry for the original (broken) slab and DR entries for each new slab
 */
export const createJournalEntriesForSlabSplit = async (
  originalSlab: any,
  originalInventoryProduct: any,
  newSlabs: any[],
  siplId: number,
  clientId: number,
  transaction: Transaction
) => {
  // Get ledger accounts
  const ledgerAccountForSlabs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
  });

  // Get locationId from inventory product
  const inventoryProductWithLocation: any = await models.InventoryProduct.findByPk(originalInventoryProduct.id, {
    attributes: ["locationId"],
    transaction,
  });

  const locationId = inventoryProductWithLocation?.locationId;

  if (!locationId) {
    throw new AppError("Location not found for inventory product", 400);
  }

  // Calculate amount for original slab (receivedSqrFt * landedUnitCost)
  const originalAmount = originalInventoryProduct.assetValue;

  // Create CR entry for the original (broken) slab
  await journalEntryRepository.create({
    amount: originalAmount,
    ledgerId: ledgerAccountForSlabs.id,
    type: JOURNAL_ENTRY_TYPE.CR,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SLAB_SPLIT,
    subReferenceId: originalSlab.id,
    subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
    referenceId: siplId || undefined,
    referenceType: siplId ? JOURNAL_ENTRY_REFERENCE_TYPES.SIPL : undefined,
    entryFor: siplId ? JOURNAL_ENTRY_FOR_TYPES.SIPL : undefined,
    entryForId: siplId || undefined,
    locationId,
  }, transaction);

  // Create DR entries for each new slab
  for (const newSlab of newSlabs) {
    // Convert to plain object if it's a Sequelize instance
    const slabData = newSlab.get ? newSlab.get({ plain: true }) : newSlab;
    const inventoryProduct = newSlab.inventoryProduct || slabData.inventoryProduct;
    const newAmount = inventoryProduct ? inventoryProduct.assetValue : decimal.decimalMultiply((slabData.receivingLength * slabData.receivingWidth) / 144, originalInventoryProduct.landedUnitCost);

    await journalEntryRepository.create({
      amount: newAmount,
      ledgerId: ledgerAccountForSlabs.id,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.SLAB_SPLIT,
      subReferenceId: slabData.id,
      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
      referenceId: siplId || undefined,
      referenceType: siplId ? JOURNAL_ENTRY_REFERENCE_TYPES.SIPL : undefined,
      entryFor: siplId ? JOURNAL_ENTRY_FOR_TYPES.SIPL : undefined,
      entryForId: siplId || undefined,
      locationId,
    }, transaction);
  }
};

/**
 * Balance inventory variance for SIPL by checking total debit and credit entries
 * and creating a balancing entry if there's a difference
 */
export async function balanceInventoryVarianceForSIPL(
  siplId: number,
  clientId: number,
  locationId: number,
  transaction: Transaction
) {
  // Get all journal entries for this SIPL
  const journalEntries = await scoped(JournalEntryModel).findAll({
    where: {
      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: siplId,
    },
    transaction,
    raw: true,
  }) as any[];

  // Calculate total debit and credit amounts
  const debitAmounts: number[] = [];
  const creditAmounts: number[] = [];

  for (const entry of journalEntries) {
    const amount = parseFloat(entry.amount);
    if (entry.type === JOURNAL_ENTRY_TYPE.DR) {
      debitAmounts.push(amount);
    } else if (entry.type === JOURNAL_ENTRY_TYPE.CR) {
      creditAmounts.push(amount);
    }
  }

  const totalDebit = decimal.decimalSum(debitAmounts);
  const totalCredit = decimal.decimalSum(creditAmounts);

  // Calculate the difference
  const difference = decimal.decimalSubtract(totalDebit, totalCredit);

  // If there's a difference, create a balancing entry
  if (difference != 0) {
    // Get inventory variance ledger account
    const inventoryVarianceLedgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
      clientId,
    }, transaction);

    if (!inventoryVarianceLedgerAccount) {
      throw new AppError("Inventory variance ledger account not found", 404);
    }

    const inventoryVarianceLedgerAccountObj = inventoryVarianceLedgerAccount.get({ plain: true });

    // Determine the type of balancing entry needed
    // If debit > credit, we need a credit entry to balance
    // If credit > debit, we need a debit entry to balance
    const balancingType = Number(difference) > 0 ? JOURNAL_ENTRY_TYPE.CR : JOURNAL_ENTRY_TYPE.DR;
    const balancingAmount = Math.abs(Number(difference));

    // Get finished goods ledger account for party ledger account
    const finishedGoodsLedgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      clientId,
    }, transaction);

    if (!finishedGoodsLedgerAccount) {
      throw new AppError("Finished goods ledger account not found", 404);
    }

    // Create the balancing journal entry
    await journalEntryRepository.create({
      amount: balancingAmount,
      ledgerId: inventoryVarianceLedgerAccountObj.id,
      type: balancingType,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,
      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: siplId,
      locationId,
    }, transaction);
  }
}

export async function createJournalEntriesForPaymentBills(bill: any, paymentData: any, transaction: Transaction, locationId: number) {

  if (!paymentData.account) {
    throw new AppError("Ledger account id is required for payment", 400)
  }

  const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: paymentData.payeeId,
    referenceType: paymentData.payeeType,
    clientId: paymentData.clientId,
  });

  // const ledgerAccountForCashBank: any = await ledgerAccountRepository.getLedgerAccountByFilter({
  //   key: DEFAULT_LEDGER_ACCOUNT_KEYS.CASH_BANK,
  //   clientId: paymentData.clientId,
  // });

  if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.BILL) {

    await createJournalEntryForBillForPaymentBill(bill, ledgerAccount, paymentData.account, transaction, locationId);

  } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SIPL) {

    await createJournalEntryForSiplForPaymentBill(bill, ledgerAccount, paymentData.account, transaction, locationId);

  } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) {

    await createJournalEntryForSoInvoiceForPaymentInvoice(bill, ledgerAccount, paymentData.account, transaction, locationId);

  }
}

// Get all Journal entries with filter
export const getAllJournalEntries = async (filters: any, clientId: number) => {
  let data: any[] = await journalEntryRepository.findAll(filters, clientId);

  data = data.map((e: any) => {
    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.ledgerAccount.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.ledgerType = COA_TYPES.find((k) => k.id == e.header.parent_id);

    return e;
  });

  return data;
};

// Create journal entry
export const createJournalEntry = async (data: JournalEntry) => {
  return await journalEntryRepository.create(data);
};

async function createJournalEntryForSoInvoiceForPaymentInvoice(bill: any, ledgerAccount: any, paymentAccountId: number, transaction: Transaction, locationId: number) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: paymentAccountId
  };

  // Second Journal entry.
  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: paymentAccountId,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST_INVOICE,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: ledgerAccount.id
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}

async function createJournalEntryForSiplForPaymentBill(bill: any, ledgerAccount: any, paymentAccountId: number, transaction: Transaction, locationId: number) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: bill.referenceId,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SIPL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: paymentAccountId
  };

  // Second Journal entry.
  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: paymentAccountId,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: bill.referenceId,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: ledgerAccount.id
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}

async function createJournalEntryForBillForPaymentBill(bill: any, ledgerAccount: any, paymentAccountId: number, transaction: Transaction, locationId: number) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: paymentAccountId
  };

  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: paymentAccountId,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId,
    locationId,
    partyLedgerAccountId: ledgerAccount.id
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}

export async function createJournalEntriesForTradeServicesOfPackagingList(packagingList: any, locationId: number, transaction: Transaction) {
  // Find all trade services for this packaging list
  const tradeServices = await tradeServiceRepository.findTradeServices({
    referenceType: TRADE_SERVICE_REFERENCE_TYPES.PACKAGING_LIST,
    referenceId: packagingList.id
  });

  if (!tradeServices.length) return;

  // Get packaging list for customerId and locationId
  if (!packagingList) throw new AppError("Packaging List not found", 404);

  // Get customer ledger account
  const customerLedgerAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: packagingList.salesOrder?.customerId,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER
  }, transaction);

  if (!customerLedgerAccount) throw new AppError("Customer ledger account not found", 404);

  const customerLedgerAccountObj = customerLedgerAccount?.get({ plain: true });
  if (!customerLedgerAccountObj) throw new AppError("Customer ledger account not found", 404);

  for (const tradeServiceInstance of tradeServices) {
    const tradeService = tradeServiceInstance.get ? tradeServiceInstance.get({ plain: true }) : tradeServiceInstance;
    const service = tradeService.service;
    if (!service || !service.ledgerAccountId) {
      throw new AppError("TradeService's service or ledgerAccountId not found", 400);
    }

    await journalEntryRepository.create({
      amount: Number(tradeService.quantity) * Number(tradeService.price),
      ledgerId: service.ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST,
      referenceId: packagingList.id,
      entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
      entryForId: packagingList.id,
      locationId: locationId,
      partyLedgerAccountId: customerLedgerAccountObj.id
    }, transaction);

    await journalEntryRepository.create({
      amount: Number(tradeService.quantity) * Number(tradeService.price),
      ledgerId: customerLedgerAccountObj.id,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICING,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.PACKAGING_LIST,
      referenceId: packagingList.id,
      entryFor: JOURNAL_ENTRY_FOR_TYPES.PACKAGING_LIST,
      entryForId: packagingList.id,
      locationId: locationId,
      partyLedgerAccountId: service.ledgerAccountId
    }, transaction);

  }
}
export async function createJournalEntriesForTradeServicesOfReturns(returnData: any, locationId: number, transaction: Transaction) {
  // Get packaging list for customerId and locationId
  if (!returnData) throw new AppError("RO not found", 404);

  if (!returnData?.soInvoice?.customerId) {
    throw new AppError('customer Id is required for services journal entry', 400)
  }

  // Find all trade services for this packaging list
  const tradeServices = await tradeServiceRepository.findTradeServices({
    referenceType: TRADE_SERVICE_REFERENCE_TYPES.RETURN,
    referenceId: returnData.id
  });

  if (!tradeServices.length) return;


  // Get customer ledger account
  const customerLedgerAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: returnData.soInvoice.customerId,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER
  }, transaction);

  if (!customerLedgerAccount) throw new AppError("Customer ledger account not found", 404);

  const customerLedgerAccountObj = customerLedgerAccount?.get({ plain: true });

  for (const tradeServiceInstance of tradeServices) {
    const tradeService = tradeServiceInstance.get ? tradeServiceInstance.get({ plain: true }) : tradeServiceInstance;

    const service = tradeService.service;
    if (!service || !service.ledgerAccountId) {
      throw new AppError("TradeService's service or ledgerAccountId not found", 400);
    }

    await journalEntryRepository.create({
      amount: tradeService.total,
      ledgerId: service.ledgerAccountId,
      type: tradeService.applyToCustomer ? JOURNAL_ENTRY_TYPE.CR : JOURNAL_ENTRY_TYPE.DR,

      processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
      referenceId: returnData.id,

      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.TRADE_SERVICE,
      subReferenceId: tradeService.id,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
      entryForId: returnData.id,
      locationId: locationId,
      partyLedgerAccountId: customerLedgerAccountObj.id
    }, transaction);

    await journalEntryRepository.create({
      amount: tradeService.total,
      ledgerId: customerLedgerAccountObj.id,
      type: tradeService.applyToCustomer ? JOURNAL_ENTRY_TYPE.DR : JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
      referenceId: returnData.id,

      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.TRADE_SERVICE,
      subReferenceId: tradeService.id,


      entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
      entryForId: returnData.id,
      locationId: locationId,
      partyLedgerAccountId: service.ledgerAccountId
    }, transaction);

  }
}

export async function createJournalEntriesForTradeServicesOfSIPL(sipl: any, locationId: number, transaction: Transaction) {
  // Find all trade services for this packaging list
  const tradeServices = await tradeServiceRepository.findTradeServices({
    referenceType: TRADE_SERVICE_REFERENCE_TYPES.SIPL,
    referenceId: sipl.id
  });

  if (!tradeServices.length) return;

  // Get customer ledger account
  const vendorLedgerAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: sipl.purchaseOrder.supplierId,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR
  }, transaction);

  if (!vendorLedgerAccount) throw new AppError("Vendor ledger account not found", 404);

  const customerLedgerAccountObj = vendorLedgerAccount?.get({ plain: true });
  if (!customerLedgerAccountObj) throw new AppError("Vendor ledger account not found", 404);

  for (const tradeServiceInstance of tradeServices) {
    const tradeService = tradeServiceInstance.get({ plain: true });

    const service = tradeService.service;
    if (!service || !service.ledgerAccountId) {
      throw new AppError("TradeService's service or ledgerAccountId not found", 400);
    }

    await journalEntryRepository.create({
      amount: Number(tradeService.quantity) * Number(tradeService.price),
      ledgerId: service.ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
      referenceId: sipl.id,
      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: sipl.id,
      locationId: locationId,
      partyLedgerAccountId: customerLedgerAccountObj.id
    }, transaction);

    await journalEntryRepository.create({
      amount: Number(tradeService.quantity) * Number(tradeService.price),
      ledgerId: customerLedgerAccountObj.id,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
      referenceId: sipl.id,
      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: sipl.id,
      locationId: locationId,
      partyLedgerAccountId: service.ledgerAccountId
    }, transaction);

  }
}

export async function reverseJournalEntriesForSIPL(siplId: number, transaction: Transaction, locationId: number) {
  // Find all journal entries related to the SIPL creation
  const entries: any[] = await scoped(JournalEntryModel).findAll({
    where: {
      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,
    },
    transaction,
  });

  for (const entry of entries) {
    const plainEntry = entry.get ? entry.get({ plain: true }) : entry;

    // Reverse the type (DR <-> CR)
    const reversedType = plainEntry.type === JOURNAL_ENTRY_TYPE.DR ? JOURNAL_ENTRY_TYPE.CR : JOURNAL_ENTRY_TYPE.DR;

    // Create the reversed entry
    await journalEntryRepository.create({
      amount: plainEntry.amount,
      ledgerId: plainEntry.ledgerId,
      type: reversedType,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CANCEL_SIPL,
      subReferenceId: plainEntry.subReferenceId,
      subReferenceType: plainEntry.subReferenceType,
      referenceId: plainEntry.referenceId,
      referenceType: plainEntry.referenceType,
      entryFor: plainEntry.entryFor,
      entryForId: plainEntry.entryForId,
      locationId: plainEntry.locationId,
      partyLedgerAccountId: plainEntry.partyLedgerAccountId,
    }, transaction);
  }
}

export async function createJournalEntriesForSiplCreditNote(creditNote: any, siplData: any, cogsAmount: number, finishedGoodsAmount: number, clientId: number, transaction: Transaction) {
  // Get vendor ledger account
  const vendorLedgerAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: siplData.purchaseOrder.supplierId,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR
  }, transaction);

  if (!vendorLedgerAccount) throw new AppError("Vendor ledger account not found", 404);

  const vendorLedgerObj = vendorLedgerAccount.get ? vendorLedgerAccount.get({ plain: true }) : vendorLedgerAccount;

  // Get Inventory In Transit ledger account
  const inventoryLedgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
    clientId,
  }, transaction);

  if (!inventoryLedgerAccount) throw new AppError("Inventory In Transit ledger account not found", 404);

  const inventoryLedgerObj = inventoryLedgerAccount.get ? inventoryLedgerAccount.get({ plain: true }) : inventoryLedgerAccount;

  const isDebitNote = creditNote.type === CREDIT_DEBIT_NOTE_TYPES.DEBIT;
  
  // Debit Note: Vendor CR, Inventory DR
  // Credit Note: Vendor DR, Inventory CR
  const vendorEntryType = isDebitNote ? JOURNAL_ENTRY_TYPE.CR : JOURNAL_ENTRY_TYPE.DR;
  const inventoryEntryType = isDebitNote ? JOURNAL_ENTRY_TYPE.DR : JOURNAL_ENTRY_TYPE.CR;

  // Vendor Entry
  await journalEntryRepository.create({
    amount: creditNote.amount,
    ledgerId: vendorLedgerObj.id,
    type: vendorEntryType,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SIPL_CREDIT_NOTE,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: siplData.id,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: siplData.id,
    partyLedgerAccountId: inventoryLedgerObj.id,
  } as any, transaction);

  // Inventory In Transit Entry
  await journalEntryRepository.create({
    amount: creditNote.amount,
    ledgerId: inventoryLedgerObj.id,
    type: inventoryEntryType,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SIPL_CREDIT_NOTE,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: siplData.id,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: siplData.id,
    partyLedgerAccountId: vendorLedgerObj.id,
  } as any, transaction);
}

export async function reverseJournalEntriesForSiplCreditNotes(siplId: number, transaction: Transaction, locationId: number) {
  const entries: any[] = await scoped(JournalEntryModel).findAll({
    where: {
      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.SIPL_CREDIT_NOTE,
    },
    transaction,
  });

  for (const entry of entries) {
    const plainEntry = entry.get ? entry.get({ plain: true }) : entry;
    const reversedType = plainEntry.type === JOURNAL_ENTRY_TYPE.DR ? JOURNAL_ENTRY_TYPE.CR : JOURNAL_ENTRY_TYPE.DR;

    await journalEntryRepository.create({
      amount: plainEntry.amount,
      ledgerId: plainEntry.ledgerId,
      type: reversedType,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CANCEL_SIPL,
      subReferenceId: plainEntry.subReferenceId,
      subReferenceType: plainEntry.subReferenceType,
      referenceId: plainEntry.referenceId,
      referenceType: plainEntry.referenceType,
      entryFor: plainEntry.entryFor,
      entryForId: plainEntry.entryForId,
      locationId: plainEntry.locationId,
      partyLedgerAccountId: plainEntry.partyLedgerAccountId,
    }, transaction);
  }
}
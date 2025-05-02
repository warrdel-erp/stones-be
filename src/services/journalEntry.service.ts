import { Transaction } from "sequelize";
import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES, DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import {
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
  PAYMENT_BILL_REFERENCE_TYPES,
} from "../constants/tableTypes";
import { JournalEntry } from "../models/journalEntry.model";

import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as purchaseOrderRepository from "../repositories/purchaseOrder.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabService from "../services/slab.service";
import * as siplService from "./sipl.service";

// Create journal entry for freight bill item.
export async function createJournalEntryForFreightBillItem(
  freightBillItemData: any,
  freightBillData: any,
  calculations: any,
  transaction: Transaction
) {
  /**
   * Create journal entry for freight bill item.
   */
  const siplJournalEntry = await journalEntryRepository.create(
    {
      amount: freightBillItemData.amount,
      ledgerId: freightBillItemData.ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.ADD_FREIGHT_BILL,

      // Sub reference is the bill item.
      subReferenceId: freightBillItemData.id,
      subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.BILL_ITEM,

      // reference is the BILL.
      referenceId: freightBillData.id,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: freightBillData.referenceId
    },
    transaction
  );

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
      entryForId: freightBillData.referenceId
    };
  });

  // // create data for freight item entry as per product.
  // const freightItemEntryDataAsPerProduct = calculations.dataAccordingToProduct.map((productCalc: any): JournalEntry => {
  //   return {
  //     amount: unitFreightItemCost * productCalc.totalReceivedArea,
  //     ledgerId: freightBillItemData.ledgerAccountId,
  //     type: JOURNAL_ENTRY_TYPE.DR,
  //     processType: JOURNAL_ENTRY_PROCESS_TYPE.ADD_FREIGHT_BILL,

  //     // Sub reference is the product.
  //     subReferenceId: productCalc.product.id,
  //     subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.PRODUCT,

  //     // reference is the SIPL.
  //     referenceId: freightBillData.referenceId,
  //     referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
  //   };
  // });

  // create journal entry for products.
  const productJournalEntry = await journalEntryRepository.createBulk(
    freightItemEntryDataAsPerSiplProduct,
    transaction
  );

  return {
    siplJournalEntry,
    productJournalEntry,
  };
}

// Create journal entry for SIPL.
export async function createJournalEntryForSIPL(siplId: number, siplData: any, transaction: Transaction) {
  const calculations = await siplService.getSiplCalculations(siplId, transaction);

  const po = await purchaseOrderRepository.getPOWithVendorLedgerAccount(siplData.purchaseOrderId, transaction);

  const siplJournalEntry = await journalEntryRepository.create(
    {
      amount: calculations.totalAmount,
      ledgerId: po.supplier.ledgerAccount.id,
      type: JOURNAL_ENTRY_TYPE.CR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,

      referenceId: siplId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

      entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
      entryForId: siplId
    },
    transaction
  );

  // Get in_inventory ledger account id for products entry.
  const ledgerAccountForProducts: any = await ledgerAccountRepository.getLedgerAccountByFilter(
    {
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
      clientId: siplData.clientId,
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
      entryForId: siplId
    };
  });

  // create journal entry for products.
  const productJournalEntry = await journalEntryRepository.createBulk(arr, transaction);

  return { siplJournalEntry, productJournalEntry };
}

// create journal entry for receive inventory.
export const createJournalEntryForReceiveInventory = async (
  siplId: number,
  clientId: number,
  transaction: Transaction
) => {
  const calculations = await siplService.getSiplCalculations(siplId, transaction);

  const siplData = (await siplRepository.findSIPLById(siplId, transaction))?.get({ plain: true });

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
        entryForId: siplId
      },
      transaction
    );

    // Create journal entry for freight bill item.
    for (const bill of siplData.bills) {
      for (const billItem of bill.billItems) {
        // Unit freight item cost (amount / total received area of all products in sipl).
        const unitFreightItemCost = billItem.amount / calculations.totalReceivingArea;

        await journalEntryRepository.create({
          amount: unitFreightItemCost * productCalc.totalReceivedArea,
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
          entryForId: siplId
        }, transaction);
      }
    }
  }

  // Create Journal entry for slabs
  const ledgerAccountForSlabs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
  });

  await Promise.all(
    calculations.dataAccordingToProduct.map(async (productCalc: any) => {
      const slabs = await slabService.fetchAllSlabs({ siplId, productId: productCalc.product.id }, transaction);

      await Promise.all(
        slabs.map(async (slab: any) => {
          slab = slab.get({ plain: true });

          await journalEntryRepository.create(
            {
              amount: slab.receivingLength * slab.receivingWidth * productCalc.landedUnitCost,
              ledgerId: ledgerAccountForSlabs.id,
              type: JOURNAL_ENTRY_TYPE.DR,
              processType: JOURNAL_ENTRY_PROCESS_TYPE.RECEIVE_INVENTORY,

              // Sub reference is the slab.
              subReferenceId: slab.id,
              subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,

              // reference is the SIPL.
              referenceId: siplId,
              referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,

              entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
              entryForId: siplId
            },
            transaction
          );
        })
      );
    })
  );
};

export async function createJournalEntriesForPaymentBills(bill: any, paymentData: any, transaction: Transaction) {
  const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    referenceId: paymentData.payeeId,
  });

  const ledgerAccountForCashBank: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.CASH_BANK,
    clientId: paymentData.clientId,
  });

  if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.BILL) {

    await createJournalEntryForBillForPaymentBill(bill, ledgerAccount, ledgerAccountForCashBank, transaction);

  } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SIPL) {

    await createJournalEntryForSiplForPaymentBill(bill, ledgerAccount, ledgerAccountForCashBank, transaction);

  } else if (bill.referenceType === PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE) {

    await createJournalEntryForSoInvoiceForPaymentInvoice(bill, ledgerAccount, ledgerAccountForCashBank, transaction);

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

async function createJournalEntryForSoInvoiceForPaymentInvoice(bill: any, ledgerAccount: any, ledgerAccountForCashBank: any, transaction: Transaction) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
    entryForId: bill.referenceId
  };

  // Second Journal entry.
  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccountForCashBank.id,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SO_INVOICE_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.LOADING_ORDER,
    entryForId: bill.referenceId
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}

async function createJournalEntryForSiplForPaymentBill(bill: any, ledgerAccount: any, ledgerAccountForCashBank: any, transaction: Transaction) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: bill.referenceId,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.SIPL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId
  };

  // Second Journal entry.
  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccountForCashBank.id,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    referenceId: bill.referenceId,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}

async function createJournalEntryForBillForPaymentBill(bill: any, ledgerAccount: any, ledgerAccountForCashBank: any, transaction: Transaction) {
  const journalEntry1: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccount.id,
    type: JOURNAL_ENTRY_TYPE.DR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId
  };

  const journalEntry2: JournalEntry = {
    amount: bill.amount,
    ledgerId: ledgerAccountForCashBank.id,
    type: JOURNAL_ENTRY_TYPE.CR,
    referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.BILL,
    referenceId: bill.id,
    processType: JOURNAL_ENTRY_PROCESS_TYPE.BILL_PAYMENT,
    entryFor: JOURNAL_ENTRY_FOR_TYPES.SIPL,
    entryForId: bill.referenceId
  };

  await journalEntryRepository.create(journalEntry1, transaction);
  await journalEntryRepository.create(journalEntry2, transaction);
}


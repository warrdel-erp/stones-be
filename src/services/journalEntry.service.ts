import { Transaction } from "sequelize";
import * as journalEntryRepository from "../repositories/journalEntry.repository";
import * as siplService from "./sipl.service";
import * as purchaseOrderRepository from "../repositories/purchaseOrder.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as siplRepository from "../repositories/sipl.repository";
import { JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_TYPE } from "../constants/tableTypes";
import { JournalEntry } from "../models/journalEntry.model";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";

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
      referenceId: freightBillData.referenceId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    },
    transaction
  );

  // Unit freight item cost (amount / total received area of all products in sipl).
  const unitFreightItemCost = freightBillItemData.amount / calculations.totalReceivingArea;

  // create data for freight item entry as per product.
  const freightItemEntryDataAsPerProduct = calculations.dataAccordingToProduct.map((productCalc: any): JournalEntry => {
    return {
      amount: unitFreightItemCost * productCalc.totalReceivedArea,
      ledgerId: freightBillItemData.ledgerAccountId,
      type: JOURNAL_ENTRY_TYPE.DR,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.ADD_FREIGHT_BILL,
      referenceId: freightBillData.referenceId,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    };
  });

  // create journal entry for products.
  const productJournalEntry = await journalEntryRepository.createBulk(freightItemEntryDataAsPerProduct, transaction);

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
      referenceId: siplId,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
    },
    transaction
  );

  // Get in_inventory ledger account id for products entry.
  const ledgerAccountForProducts: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
    clientId: siplData.clientId,
  });

  // Create Journal entry data.
  const arr: JournalEntry[] = calculations.dataAccordingToProduct.map((productCalc: any): JournalEntry => {
    return {
      amount: productCalc.totalPrice,
      ledgerId: ledgerAccountForProducts.id,
      type: JOURNAL_ENTRY_TYPE.DR,
      referenceId: siplId,
      processType: JOURNAL_ENTRY_PROCESS_TYPE.CREATE_SIPL,
      referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
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
        referenceId: siplId,
        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
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
          referenceId: bill.referenceId,
          referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.SIPL,
        });
      }
    }
  }
};

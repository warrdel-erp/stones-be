import { fn, literal, Transaction } from "sequelize";
import * as models from "../models";
import { type JournalEntry } from "../models/journalEntry.model";
import { JOURNAL_ENTRY_SUB_REFERENCE_TYPES } from "../constants/tableTypes";
import { JOURNAL_ENTRY_REFERENCE_TYPES } from "../constants/tableTypes";

// Create ledger account.
export const create = async (data: JournalEntry, transaction?: Transaction) => {
  return await models.JournalEntry.create(data, { transaction });
};

// Create ledger account.
export const createBulk = async (data: JournalEntry[], transaction?: Transaction) => {
  return await models.JournalEntry.bulkCreate(data, { transaction, individualHooks: true });
};

// Fetch find journal entries with filters.
export const findAll = async (filters: any, clientId: number) => {

  const journalEntries = await models.JournalEntry.findAll({
    where: filters || {},
    include: [
      {
        model: models.LedgerAccount,
        as: "ledgerAccount",
        where: { clientId },
        required: true,
      },
      {
        model: models.LedgerAccount,
        as: "partyLedgerAccount",
      },
      {
        model: models.Location,
        as: "location",
      },
    ],
  });

  const subReferenceDataPromises = journalEntries.map(async (entry: any) => {
    entry = entry.get({ plain: true });
    switch (entry.subReferenceType) {
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB:
        entry.subReferenceData = await models.Slab.findOne({
          where: { id: entry.subReferenceId },
          include: 'inventoryProduct'
        });
        break;
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.PRODUCT:
        entry.subReferenceData = await models.Product.findOne({
          where: { id: entry.subReferenceId },
        });
        break;
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.BILL:
        entry.subReferenceData = await models.Bill.findOne({
          where: { id: entry.subReferenceId },

        });
        break;
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.BILL_ITEM:
        entry.subReferenceData = await models.BillItem.findOne({
          where: { id: entry.subReferenceId },
        });
        break;
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.LOADING_ORDER:
        entry.subReferenceData = await models.LoadingOrder.findOne({
          where: { id: entry.subReferenceId },
        });
        break;
      case JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SIPL_PRODUCT:
        entry.subReferenceData = await models.SIPLProduct.findOne({
          where: { id: entry.subReferenceId },
        });
        break;
      default:
        entry.subReferenceData = null;
    }

    switch (entry.referenceType) {
      case JOURNAL_ENTRY_REFERENCE_TYPES.SIPL:
        entry.referenceData = await models.SIPL.findOne({
          where: { id: entry.referenceId },
        });
        break;
      case JOURNAL_ENTRY_REFERENCE_TYPES.BILL:
        entry.referenceData = await models.Bill.findOne({
          where: { id: entry.referenceId },
          include: {
            model: models.SIPL,
            as: 'sipl'
          }
        });
        break;
      case JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER:
        entry.referenceData = await models.LoadingOrder.findOne({
          where: { id: entry.referenceId },
        });
        break;
      case JOURNAL_ENTRY_REFERENCE_TYPES.LOADING_ORDER_INVOICE:
        entry.referenceData = await models.SalesOrderInvoice.findOne({
          where: { id: entry.referenceId },
        });
        break;
      default:
        entry.referenceData = null;
    }

    return entry;
  });

  return await Promise.all(subReferenceDataPromises);
};

export const getFinalAmountForLedger = async (ledgerId: number) => {

  const result: any = await models.JournalEntry.findOne({
    attributes: [
      [
        fn(
          "SUM",
          literal(`CASE WHEN type = 'dr' THEN amount ELSE -amount END`)
        ),
        "netAmount"
      ]
    ],
    where: {
      ledgerId
    },
    raw: true,
  });

  return Number(result.netAmount) || 0;
}
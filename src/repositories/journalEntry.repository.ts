import { Transaction } from "sequelize";
import * as models from "../models";
import { type JournalEntry } from "../models/journalEntry.model";

// Create ledger account.
export const create = async (data: JournalEntry, transaction?: Transaction) => {
  return await models.JournalEntry.create(data, { transaction });
};

// Create ledger account.
export const createBulk = async (data: JournalEntry[], transaction?: Transaction) => {
  return await models.JournalEntry.bulkCreate(data, { transaction });
};

// Fetch find journal entries with filters.
export const findAll = async (filters: any, clientId: number) => {
  const journalEntries = await models.JournalEntry.findAll({
    where: filters || {},
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: models.LedgerAccount,
        as: "ledgerAccount",
        where: { clientId },
        required: true,
      },
    ],
  });

  return journalEntries;
};

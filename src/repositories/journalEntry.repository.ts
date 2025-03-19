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

import { Transaction } from "sequelize";
import * as models from "../models";
import { type LedgerAccount } from "../models/ledgerAccount.model";

// Create ledger account.
export const createLedgerAccount = async (data: LedgerAccount, transaction: Transaction) => {
  return await models.LedgerAccount.create(data, { transaction });
};

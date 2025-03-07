import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { type LedgerAccount } from "../models/ledgerAccount.model";

// Create ledger account.
export const createLedgerAccount = async (data: LedgerAccount, transaction?: Transaction) => {
  return await models.LedgerAccount.create(data, { transaction });
};

// Get all ledger accounts.
export const getLedgerAccounts = async (page: number, limit: number, filters: any) => {
  const offset = (page - 1) * limit;

  const whereCondition: any = filters;

  return models.LedgerAccount.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["id", "DESC"]],
  });
};

// Get ledger account by ID.
export const getLedgerAccountById = async (id: number) => {
  return models.LedgerAccount.findByPk(id);
};

// export const updateLedgerAccount = async (id: number, data: any) => {
//   return models.LedgerAccount.update(data, { where: { id }, returning: true });
// };

// export const deleteLedgerAccount = async (id: number) => {
//   return models.LedgerAccount.destroy({ where: { id } });
// };

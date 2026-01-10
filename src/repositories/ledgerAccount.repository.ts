import { Op, Sequelize, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { type LedgerAccount } from "../models/ledgerAccount.model";
import { FREIGHT_BILL_ACCOUNT_KEYS } from "../constants/coa";
import { scoped } from "../utils/scoped";

// Create ledger account.
export const createLedgerAccount = async (data: LedgerAccount, transaction?: Transaction) => {
  return await scoped(models.LedgerAccount).create(data, { transaction });
};

// Create ledger account.
export const createBulkLedgerAccount = async (data: LedgerAccount[], transaction?: Transaction) => {
  const accounts = await scoped(models.LedgerAccount).bulkCreate(data, { transaction, returning: true, individualHooks: true });
  return accounts;
};

export const getLedgerAccountByFilter = async (filter: WhereOptions, transaction?: Transaction) => {
  return await models.LedgerAccount.findOne({ where: filter, transaction });
};

// Get all ledger accounts.
export const getLedgerAccounts = async (page: number, limit: number, clientId: number, filters: any) => {
  const offset = (page - 1) * limit;

  const whereCondition: any = filters;

  return await models.LedgerAccount.findAndCountAll({
    where: { ...whereCondition, clientId },
    limit,
    offset,
    order: [["id", "DESC"]],
  });
};

// Get all ledger accounts.
export const getLedgerAccountsWithoutPagination = async (filters: any) => {
  const whereCondition: any = filters;

  return await models.LedgerAccount.findAll({
    where: whereCondition,
    order: [["id", "DESC"]],
  });
};

export const getLedgerAccountsForFreightItems = async (clientId: number) => {
  return await models.LedgerAccount.findAll({
    where: {
      clientId,
      key: {
        [Op.in]: Object.values(FREIGHT_BILL_ACCOUNT_KEYS),
      },
    },
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

export const getLedgerAccountOptions = async (clientId: number, filters: any = {}) => {
  const whereCondition: any = {
    ...filters,
    clientId,
  };

  return await models.LedgerAccount.findAll({
    attributes: [
      ["name", "label"],
      ["id", "value"],
    ],
    where: whereCondition,
    order: [["name", "ASC"]],
  });
};

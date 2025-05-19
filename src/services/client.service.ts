import bcrypt from "bcryptjs";
import { AppError } from "../helper/appError";
import { LedgerAccount } from "../models/ledgerAccount.model";
import {
  COA_SUB_HEADERS,
  DEFAULT_LEDGER_ACCOUNT_KEYS,
  FREIGHT_BILL_ACCOUNT_KEYS,
  LEDGER_ACCOUNT_TYPES,
} from "../constants/coa";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";

import * as clientRepository from "../repositories/client.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as userRepository from '../repositories/user.repository'

/**
 * Register Client
 */
export async function registerClient(clientData: any) {
  const { email, password } = clientData;

  const transaction = await sequelize.transaction();
  try {
    // Check if client exists
    const existingClient = await clientRepository.findClientByEmail(email);
    if (existingClient) {
      throw new AppError("Client already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client
    const client = await clientRepository.createClient({ ...clientData, password: hashedPassword }, transaction);

    const id = client.getDataValue("id");
    // Create default ledger accounts for client.
    const defaultLedgerAccount = await createDefaultLedgerAccountsForClient(id, transaction);

    transaction.commit();
    return { client, defaultLedgerAccount };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
}

/**
 * Service to fetch all clients with pagination and optional search.
 */
export const fetchAllClients = async (page: number, limit: number, search?: string) => {
  return clientRepository.getAllClients(page, limit, search);
};

/**
 * Service to update a client by ID.
 */
export const modifyClient = async (id: number, updateData: any) => {
  const updatedClient = await clientRepository.updateClient(id, updateData);
  if (!updatedClient) throw new AppError("User not found or update failed", 400);
  return updatedClient;
};

const createDefaultLedgerAccountsForClient = async (clientId: number, transaction: Transaction) => {
  const data: LedgerAccount[] = [
    {
      name: "Freight-In",
      clientId,
      key: FREIGHT_BILL_ACCOUNT_KEYS.FREIGHT_IN,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "freight_expense")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "Brokerage Charges",
      clientId,
      key: FREIGHT_BILL_ACCOUNT_KEYS.BROKERAGE_CHARGES,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "customs_fees_and_duty")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "Inventory Int Transit",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "in_transit")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "Finished Goods",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "merchandise")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "Cash Bank",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.CASH_BANK,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "cash_and_cash_equivalents")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "COGS",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "cost_of_goods_and_services_sold")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "Goods Sold",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "goods")?.id!,
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "State Tax",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "tax_payables")?.id!,
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
    {
      name: "County Tax",
      clientId,
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "tax_payables")?.id!,
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
      openingBalance: 0,
      openingDate: new Date(),
    },
  ] as const;

  const createdAccounts: any[] = [];
  for (const account of data) {
    const createdAccount = await ledgerAccountRepository.createLedgerAccount(account, transaction);
    createdAccounts.push(createdAccount);
  }

  return createdAccounts;
};

export const checkEmailAvailability = async (email: string) => {
  const clientExists = await clientRepository.findClientByEmail(email);
  const userExists = await userRepository.getUserByEmail(email);

  return !!userExists || !!clientExists

}

/**
 * Service to fetch a client's profile by ID.
 */
export const getClientProfile = async (clientId: number) => {
  const client = (await clientRepository.getClientById(clientId))?.get({ plain: true });
  if (!client) throw new AppError("Client not found", 404);
  return { ...client, userType: 'client' };
};
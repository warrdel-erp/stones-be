import { sequelize } from "../config/database";
import { LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import { LedgerAccount } from "../models/ledgerAccount.model";
import * as customerRepository from "../repositories/customer.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";

// Service function to create a customer.
export const registerCustomer = async (customerData: any) => {
  const transaction = await sequelize.transaction();
  try {
    if (!customerData.name || !customerData.email) {
      throw new Error("Name, and Email are required fields.");
    }

    // Create customer
    const newCustomer: any = await customerRepository.createCustomer(customerData, transaction);

    // Create Ledger Account data
    const ledgerAccountData: LedgerAccount = {
      subHeaderId: 1002,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
      referenceId: newCustomer.id,
    };

    const ledgerAccount = await ledgerAccountRepository.createLedgerAccount(ledgerAccountData, transaction);

    transaction.commit();
    return { customer: newCustomer, ledgerAccount };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Update customer
export const updateCustomer = async (id: number, data: any) => {
  const updatedCustomer = await customerRepository.updateCustomerById(id, data);
  if (!updatedCustomer) throw new AppError("Customer not found or update failed", 400);

  return updatedCustomer;
};

// Get all customers with pagination.
export const fetchAllCustomers = async (page: number, limit: number, search?: string) => {
  return await customerRepository.getAllCustomers(page, limit, search);
};

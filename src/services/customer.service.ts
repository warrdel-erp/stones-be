import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { COA_SUB_HEADERS, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import { LedgerAccount } from "../models/ledgerAccount.model";
import * as customerRepository from "../repositories/customer.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as customerAddressService from "../services/customerAddress.service";
import { SALES_TAX } from "../constants";

// Service function to create a customer.
export const registerCustomer = async (customerData: any, addresses: any[], clientId: number) => {
  const transaction = await sequelize.transaction();
  try {
    if (!customerData.name || !customerData.email) {
      throw new Error("Name, and Email are required fields.");
    }

    // Create customer
    const newCustomer: any = await customerRepository.createCustomer(customerData, transaction);

    // Associate customer id to address.
    if (Array.isArray(addresses)) {
      addresses = addresses.map((address) => {
        return {
          ...address,
          customerId: newCustomer.id,
        };
      });
    }

    // create addresses for customer.
    const newAddresses = await customerAddressService.createBulkCustomerAddress(addresses, transaction);

    // Create Ledger Account data
    const ledgerAccount = await createLedgerAccountForCustomer(clientId, newCustomer, transaction);

    transaction.commit();
    return { customer: newCustomer, addresses: newAddresses, ledgerAccount };
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
  let { customers, ...pagination } = await customerRepository.getAllCustomers(page, limit, search);

  customers = customers.map((customer: any) => {
    customer.get({ plain: true });
    customer.salesTax = SALES_TAX.find((e) => e.id == customer.salesTax);
    return customer;
  });

  return { customers, ...pagination };
};

async function createLedgerAccountForCustomer(clientId: number, newCustomer: any, transaction: Transaction) {
  const ledgerAccountData: LedgerAccount = {
    subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "accounts_notes_loans_receivable")?.id!,
    clientId,
    type: LEDGER_ACCOUNT_TYPES.DEBIT,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    referenceId: newCustomer.id,
  };

  const ledgerAccount = await ledgerAccountRepository.createLedgerAccount(ledgerAccountData, transaction);
  return ledgerAccount;
}

// Get customer by id
export const fetchCustomerById = async (id: number) => {
  return await customerRepository.getCustomerById(id);
};

import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { COA_SUB_HEADERS, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES, PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import { LedgerAccount } from "../models/ledgerAccount.model";
import * as customerRepository from "../repositories/customer.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as customerAddressService from "../services/customerAddress.service";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import * as advancedDepositRepository from "../repositories/advancedDeposit.repository";

import { PAYMENT_TERMS, SALES_TAX, SCOP } from "../constants";
import { COUNTRIES } from "../constants/countries";
import _ from "lodash";
import { sumDecimal } from "../helper";
import { decimalSubtract } from "../helper/decimal";

// Service function to create a customer.
export const registerCustomer = async (customerData: any, addresses: any[], clientId: number) => {
  const transaction = await sequelize.transaction();
  try {
    if (!customerData.name || !customerData.email) {
      throw new Error("Name, and Email are required fields.");
    }

    // Create customer
    const newCustomer: any = await customerRepository.createCustomer({ ...customerData, clientId }, transaction);

    let newAddresses: any[] = [];
    // Associate customer id to address.
    if (Array.isArray(addresses)) {
      addresses = addresses.map((address) => {
        return {
          ...address,
          customerId: newCustomer.id,
        };
      });

      // create addresses for customer.
      newAddresses = await customerAddressService.createBulkCustomerAddress(addresses, transaction);
    }

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
export const fetchAllCustomers = async (page: number, limit: number, clientId: number, search?: string, filter?: any) => {
  let { customers, ...pagination } = await customerRepository.getAllCustomers(page, limit, clientId, search, filter);

  customers = customers.map((customer: any) => {
    customer.get({ plain: true });
    customer.salesTax = SALES_TAX.find((e) => e.id == customer.salesTax);
    customer.scope = SCOP.find((e) => e.id == customer.scope)?.value;

    customer.addresses = customer.addresses.map((address: any) => {
      address = address.get({ plain: true });
      address.country = COUNTRIES.find((e) => e.id == address.countryId);

      return address
    })

    return customer;
  });

  return { customers, ...pagination };
};

async function createLedgerAccountForCustomer(clientId: number, newCustomer: any, transaction: Transaction) {
  const ledgerAccountData: LedgerAccount = {
    name: newCustomer.name,
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
  const customer = await customerRepository.getCustomerById(id);
  return customer
};

// Get customer minimal data (less detailed)
export const getCustomerMinimal = async (id: number, clientId: number) => {
  const customer = await customerRepository.getCustomerMinimal(id, clientId);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
};

// Get invoices for a customer
export const getInvoicesByCustomerId = async (customerId: number) => {
  let invoices: any = await soInvoiceRepository.getAllInvoices({ customerId });

  const finalData = await Promise.all(
    invoices.map(async (soInvoice: any) => {
      const paidAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
        soInvoice.id,
        PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE
      );

      soInvoice = soInvoice.get({ plain: true });

      const settledWithAdvancedDeposits = soInvoice.advancedDepositSettlements.map((e: any) => e.advancedDeposit.code).join(" | ")

      return {
        id: soInvoice.id,
        dueDate: soInvoice.loadingOrder.expDeliveryDate,
        amount: soInvoice.finalAmount,
        paidAmount,
        dueAmount: decimalSubtract(soInvoice.finalAmount, paidAmount),
        creationDate: soInvoice.createdAt,
        code: soInvoice.invoiceCode,
        loNumber: soInvoice.loadingOrder.clientLoNumber,
        loDate: soInvoice.loadingOrder.loDate,
        settledWithAdvancedDeposits,
        type: "invoice"
      };
    })
  );

  return finalData;
};

// Get advanced deposits for a customer
export const getAdvancedDepositsByCustomerId = async (customerId: number) => {
  let advancedDeposits: any = await advancedDepositRepository.getAdvancedDepositWithoutPagination({});

  // Filter advanced deposits by customer through sales order relationship
  const customerAdvancedDeposits = advancedDeposits.filter((deposit: any) =>
    deposit.salesOrder && deposit.salesOrder.customerId === customerId
  );

  const finalData = await Promise.all(
    customerAdvancedDeposits.map(async (advancedDeposit: any) => {
      advancedDeposit = advancedDeposit.get({ plain: true });

      const totalSettledAmount = sumDecimal(advancedDeposit.settlements, "amount")

      return {
        id: advancedDeposit.id,
        amount: advancedDeposit.amount,
        creationDate: advancedDeposit.createdAt,
        soId: advancedDeposit.salesOrderId,
        code: advancedDeposit.code,
        accountName: advancedDeposit.ledgerAccount?.name,
        paymentMethod: advancedDeposit.payment?.paymentMethod,
        paidAmount: totalSettledAmount,
        dueAmount: '-' + decimalSubtract(advancedDeposit.amount, totalSettledAmount),
        type: "advancedDeposit"
      };
    })
  );

  return finalData;
};

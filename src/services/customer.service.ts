import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { COA_SUB_HEADERS, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { CUSTOMER_ADDRESS_TYPES, LEDGER_ACCOUNT_REFERENCE_TYPES, PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import { LedgerAccount } from "../models/ledgerAccount.model";
import * as customerRepository from "../repositories/customer.repository";
import * as customerAddressRepository from "../repositories/customerAddress.repository";
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
import csv from "csv-parser";
import { Readable } from "stream";
import { customerBulkUploadSchema } from "../validators/customer.validator";

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

/**
 * Validates referenced IDs and primaryPhoneNumber uniqueness in CSV data.
 */
const validateBulkCustomerIds = async (csvRows: any[], clientId: number) => {
  const uniqueIds = {
    salesTaxIds: new Set<number>(),
    paymentTermIds: new Set<number>(),
    scopeIds: new Set<number>(),
    countryIds: new Set<number>(),
  };
  const primaryPhoneNumbersInCsv = new Set<string>();
  const duplicatePhonesInCsv = new Set<string>();

  csvRows.forEach((row) => {
    const phone = (row.primaryPhoneNumber || row.PrimaryPhoneNumber || "").trim();
    if (phone) {
      if (primaryPhoneNumbersInCsv.has(phone)) {
        duplicatePhonesInCsv.add(phone);
      }
      primaryPhoneNumbersInCsv.add(phone);
    }
    if (row.salesTaxId) uniqueIds.salesTaxIds.add(Number(row.salesTaxId));
    if (row.paymentTermId) uniqueIds.paymentTermIds.add(Number(row.paymentTermId));
    if (row.scopeId) uniqueIds.scopeIds.add(Number(row.scopeId));
    if (row.shippingCountryId) uniqueIds.countryIds.add(Number(row.shippingCountryId));
    if (row.remitCountryId) uniqueIds.countryIds.add(Number(row.remitCountryId));
  });

  const errors: string[] = [];
  duplicatePhonesInCsv.forEach((phone) => {
    errors.push(`Duplicate primaryPhoneNumber found in CSV: "${phone}"`);
  });

  const existingCustomers = await customerRepository.findCustomersByPrimaryPhoneNumbers(clientId, Array.from(primaryPhoneNumbersInCsv));
  existingCustomers.forEach((c: any) => {
    errors.push(`primaryPhoneNumber already exists in database: "${c.primaryPhoneNumber}"`);
  });

  if (errors.length > 0) {
    throw new AppError(`Bulk validation failed:\n${errors.join("\n")}`, 400);
  }

  const validateInConstant = (constant: readonly { id: number }[], ids: Set<number>, name: string) => {
    const validIds = new Set(constant.map((item) => item.id));
    ids.forEach((id) => {
      if (!validIds.has(id)) {
        throw new AppError(`Invalid ${name} ID: ${id}`, 400);
      }
    });
  };

  validateInConstant(SALES_TAX, uniqueIds.salesTaxIds, "Sales Tax");
  validateInConstant(PAYMENT_TERMS, uniqueIds.paymentTermIds, "Payment Term");
  validateInConstant(SCOP, uniqueIds.scopeIds, "Scope");
  validateInConstant(COUNTRIES, uniqueIds.countryIds, "Country");
};

/**
 * Parses and validates CSV rows, maps to customer + optional address format.
 */
const prepareBulkCustomerData = (csvRows: any[], userId: number) => {
  const customers: any[] = [];
  const errors: string[] = [];

  csvRows.forEach((data) => {
    const rowNum = data._rowNumber;

    const inputData = {
      name: (data.name || data.Name || "").trim(),
      email: (data.email || data.Email || "").trim(),
      contactName: data.contactName || data.ContactName || null,
      printName: data.printName || data.PrintName || null,
      primaryPhoneNumber: (data.primaryPhoneNumber || data.PrimaryPhoneNumber || "").trim(),
      secondaryPhoneNumber: data.secondaryPhoneNumber || data.SecondaryPhoneNumber || null,
      landlineNumber: data.landlineNumber || data.LandlineNumber || null,
      type: data.type || data.Type || null,
      priceLevel: data.priceLevel || data.PriceLevel || null,
      taxExempt: data.taxExempt === "true" || data.taxExempt === "1",
      salesTaxId: data.salesTaxId ? Number(data.salesTaxId) : null,
      paymentTermId: data.paymentTermId ? Number(data.paymentTermId) : null,
      internalNotes: data.internalNotes || data.InternalNotes || null,
      status: (data.status || "active") as "active" | "inactive",
      scopeId: data.scopeId ? Number(data.scopeId) : null,
      // Shipping address
      shippingAddress: data.shippingAddress || null,
      shippingAddressLine: data.shippingAddressLine || null,
      shippingUnit: data.shippingUnit || null,
      shippingLat: data.shippingLat ? parseFloat(data.shippingLat) : null,
      shippingLong: data.shippingLong ? parseFloat(data.shippingLong) : null,
      shippingContactName: data.shippingContactName || null,
      shippingContactEmail: data.shippingContactEmail || null,
      shippingContactNumber: data.shippingContactNumber || null,
      shippingCountryId: data.shippingCountryId ? Number(data.shippingCountryId) : null,
      // Remit address
      remitAddress: data.remitAddress || null,
      remitAddressLine: data.remitAddressLine || null,
      remitUnit: data.remitUnit || null,
      remitLat: data.remitLat ? parseFloat(data.remitLat) : null,
      remitLong: data.remitLong ? parseFloat(data.remitLong) : null,
      remitContactName: data.remitContactName || null,
      remitContactEmail: data.remitContactEmail || null,
      remitContactNumber: data.remitContactNumber || null,
      remitCountryId: data.remitCountryId ? Number(data.remitCountryId) : null,
    };

    const validation = customerBulkUploadSchema.safeParse(inputData);

    if (!validation.success) {
      const rowErrors = validation.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      errors.push(`Row ${rowNum}: ${rowErrors}`);
    } else {
      customers.push({ ...validation.data, _rowNumber: rowNum });
    }
  });

  if (errors.length > 0) {
    throw new AppError(`Validation failed for some rows: \n${errors.join("\n")}`, 400);
  }

  return customers;
};

/**
 * Bulk upload customers via CSV.
 */
export const bulkUploadCustomers = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  const csvRows: any[] = [];
  let rowNumber = 1;

  // 1. Parse CSV
  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    stream
      .pipe(csv())
      .on("data", (data) => csvRows.push({ ...data, _rowNumber: ++rowNumber }))
      .on("end", resolve)
      .on("error", reject);
  });

  if (csvRows.length === 0) {
    throw new AppError("No customers found in the CSV file.", 400);
  }

  // 2. Validate referenced IDs and primaryPhoneNumber uniqueness
  await validateBulkCustomerIds(csvRows, clientId);

  // 3. Prepare and validate row data
  const customersData = prepareBulkCustomerData(csvRows, userId);

  // 4. Prepare customers and addresses separately
  const customersToCreate: any[] = [];
  const addressDataByCustomer: Map<string, any[]> = new Map(); // key: primaryPhoneNumber, value: array of addresses

  customersData.forEach((row) => {
    const {
      shippingAddress,
      shippingAddressLine,
      shippingUnit,
      shippingLat,
      shippingLong,
      shippingContactName,
      shippingContactEmail,
      shippingContactNumber,
      shippingCountryId,
      remitAddress,
      remitAddressLine,
      remitUnit,
      remitLat,
      remitLong,
      remitContactName,
      remitContactEmail,
      remitContactNumber,
      remitCountryId,
      _rowNumber,
      ...customerData
    } = row;

    customersToCreate.push({
      ...customerData,
      createdBy: userId,
      updatedBy: userId,
      clientId,
    });

    // Store address data if present
    const addresses: any[] = [];

    // Shipping address
    if (shippingAddress && String(shippingAddress).trim()) {
      addresses.push({
        address: String(shippingAddress).trim(),
        addressLine: shippingAddressLine || null,
        unit: shippingUnit || null,
        lat: shippingLat || null,
        long: shippingLong || null,
        contactName: shippingContactName || null,
        contactEmail: shippingContactEmail || null,
        contactNumber: shippingContactNumber || null,
        countryId: shippingCountryId || null,
        addressType: CUSTOMER_ADDRESS_TYPES.SHIPPING,
        clientId,
      });
    }

    // Remit address
    if (remitAddress && String(remitAddress).trim()) {
      addresses.push({
        address: String(remitAddress).trim(),
        addressLine: remitAddressLine || null,
        unit: remitUnit || null,
        lat: remitLat || null,
        long: remitLong || null,
        contactName: remitContactName || null,
        contactEmail: remitContactEmail || null,
        contactNumber: remitContactNumber || null,
        countryId: remitCountryId || null,
        addressType: CUSTOMER_ADDRESS_TYPES.REMIT,
        clientId,
      });
    }

    if (addresses.length > 0) {
      addressDataByCustomer.set(customerData.primaryPhoneNumber, addresses);
    }
  });

  // 5-9. Execute all creates within a single transaction (no scoped - IDs passed manually)
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    // 5. Bulk create customers
    const createdCustomers: any[] = await customerRepository.bulkCreateCustomers(customersToCreate, transaction);

    // 6. Prepare addresses with customer IDs (clientId already in each row)
    const addressesToCreate: any[] = [];
    createdCustomers.forEach((customer: any) => {
      const addresses = addressDataByCustomer.get(customer.primaryPhoneNumber);
      if (addresses && addresses.length > 0) {
        addresses.forEach((addressData) => {
          addressesToCreate.push({
            ...addressData,
            customerId: customer.id,
          });
        });
      }
    });

    // 7. Bulk create addresses
    if (addressesToCreate.length > 0) {
      await customerAddressRepository.bulkCreateCustomerAddressesForBulkUpload(addressesToCreate, transaction);
    }

    // 8. Prepare ledger accounts for all customers (clientId passed explicitly)
    const subHeaderId = COA_SUB_HEADERS.find((e) => e.key == "accounts_notes_loans_receivable")?.id;
    if (!subHeaderId) {
      throw new AppError("Ledger account sub-header not found.", 500);
    }

    const ledgerAccountsToCreate: any[] = createdCustomers.map((customer: any) => ({
      name: customer.name,
      subHeaderId,
      clientId,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
      referenceId: customer.id,
    }));

    // 9. Bulk create ledger accounts
    await ledgerAccountRepository.bulkCreateLedgerAccountsForBulkUpload(ledgerAccountsToCreate, transaction);

    return { createdCustomersCount: createdCustomers.length };
  });

  return result;
};

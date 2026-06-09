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
import * as s3FileRepository from "../repositories/s3File.repository";
import { generateSignedGetUrl } from "../services/s3File.service";
import * as salesOrderInvoiceService from "./salesOrderInvoice.service";
import CustomerTransaction from "../models/customerTransaction.model";

import { PAYMENT_TERMS, SALES_TAX, SCOP } from "../constants";
import { COUNTRIES } from "../constants/countries";
import _ from "lodash";
import * as XLSX from "xlsx";
import { sumDecimal } from "../helper";
import { decimalSubtract } from "../helper/decimal";
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

    // If an S3 file was attached, mark it permanent (isTemp → false) within the same transaction
    if (customerData.imageFileId) {
      await s3FileRepository.markS3FilePermanent(customerData.imageFileId, transaction);
    }

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

  // If a new S3 file was attached, mark it permanent (isTemp → false)
  if (data.imageFileId) {
    await s3FileRepository.markS3FilePermanent(data.imageFileId);
  }

  return updatedCustomer;
};

// Get all customers with pagination.
export const fetchAllCustomers = async (page: number, limit: number, clientId: number, search?: string, filter?: any) => {
  let { customers, ...pagination } = await customerRepository.getAllCustomers(page, limit, clientId, search, filter);

  customers = await Promise.all(customers.map(async (customer: any) => {
    customer = customer.get({ plain: true });
    customer.salesTax = SALES_TAX.find((e) => e.id == customer.salesTax);
    customer.scope = SCOP.find((e) => e.id == customer.scope)?.value;

    customer.addresses = customer.addresses?.map((address: any) => {
      address = address.countryId ? address : address; // Just in case it's plain
      address.country = COUNTRIES.find((e) => e.id == address.countryId);
      return address;
    }) || [];

    if (customer.image?.s3Bucket && customer.image?.s3Key) {
      customer.image.url = await generateSignedGetUrl(customer.image.s3Bucket, customer.image.s3Key);
    }

    return customer;
  }));

  return { customers, ...pagination };
};

async function createLedgerAccountForCustomer(clientId: number, newCustomer: any, transaction: Transaction) {
  let parentLedger = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: "account_receivable",
    clientId,
  }, transaction);

  if (!parentLedger) {
    const subHeaderId = COA_SUB_HEADERS.find((e) => e.key == "accounts_notes_loans_receivable")?.id!;
    parentLedger = await ledgerAccountRepository.createLedgerAccount({
      name: "Account Receivable",
      key: "account_receivable",
      subHeaderId,
      clientId,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    }, transaction);
  }

  const ledgerAccountData: LedgerAccount = {
    name: newCustomer.name,
    subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "accounts_notes_loans_receivable")?.id!,
    clientId,
    type: LEDGER_ACCOUNT_TYPES.DEBIT,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    referenceId: newCustomer.id,
    parentId: parentLedger.id,
  };

  const ledgerAccount = await ledgerAccountRepository.createLedgerAccount(ledgerAccountData, transaction);
  return ledgerAccount;
}

// Get customer by id
export const fetchCustomerById = async (id: number) => {
  const customer = await customerRepository.getCustomerById(id);
  
  if (customer?.image?.s3Bucket && customer?.image?.s3Key) {
    customer.image.url = await generateSignedGetUrl(customer.image.s3Bucket, customer.image.s3Key);
  }

  return customer;
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
        dueDate: soInvoice.packagingList.expDeliveryDate,
        amount: soInvoice.finalAmount,
        paidAmount,
        dueAmount: decimalSubtract(soInvoice.finalAmount, paidAmount),
        creationDate: soInvoice.createdAt,
        code: soInvoice.invoiceCode,
        loNumber: soInvoice.packagingList.clientPlNumber,
        plDate: soInvoice.packagingList.plDate,
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
/**
 * Helper to map sales tax string/ID to its database ID.
 */
const mapSalesTaxToId = (data: any) => {
  let salesTaxId = data.salesTaxId ? Number(data.salesTaxId) : null;
  const salesTaxStr = data.salesTax || data.SalesTax;
  if (salesTaxStr && typeof salesTaxStr === "string") {
    const code = salesTaxStr.split(" - ")[0].trim();
    const taxMatch = SALES_TAX.find((t) => t.code === code);
    if (taxMatch) {
      salesTaxId = taxMatch.id;
    } else {
      return { id: null, error: `Invalid sales tax code "${code}" derived from "${salesTaxStr}"` };
    }
  }
  return { id: salesTaxId, error: null };
};

const validateBulkCustomerIds = async (csvRows: any[], clientId: number) => {
  const uniqueIds = {
    salesTaxIds: new Set<number>(),
    paymentTermIds: new Set<number>(),
    scopeIds: new Set<number>(),
    countryIds: new Set<number>(),
  };
  const phoneToRowNumbers = new Map<string, number[]>();
  const codeToRowNumbers = new Map<string, number[]>();

  csvRows.forEach((row) => {
    const phone = (row.primaryPhoneNumber || row.PrimaryPhoneNumber || "").toString().trim();
    if (phone) {
      if (!phoneToRowNumbers.has(phone)) {
        phoneToRowNumbers.set(phone, []);
      }
      phoneToRowNumbers.get(phone)!.push(row._rowNumber);
    }

    const code = (row.customerCode || row.CustomerCode);
    if (code) {
      if (!codeToRowNumbers.has(code)) {
        codeToRowNumbers.set(code, []);
      }
      codeToRowNumbers.get(code)!.push(row._rowNumber);
    }

    const { id: sTaxId } = mapSalesTaxToId(row);
    if (sTaxId) uniqueIds.salesTaxIds.add(sTaxId);

    if (row.paymentTermId) uniqueIds.paymentTermIds.add(Number(row.paymentTermId));
    if (row.scopeId) uniqueIds.scopeIds.add(Number(row.scopeId));
    if (row.shippingCountryId) uniqueIds.countryIds.add(Number(row.shippingCountryId));
    if (row.remitCountryId) uniqueIds.countryIds.add(Number(row.remitCountryId));
  });

  const errors: string[] = [];

  // Report duplicates within the CSV
  phoneToRowNumbers.forEach((rows, phone) => {
    if (rows.length > 1) {
      errors.push(`Duplicate primaryPhoneNumber "${phone}" found in CSV rows: ${rows.join(", ")}`);
    }
  });

  codeToRowNumbers.forEach((rows, code) => {
    if (rows.length > 1) {
      errors.push(`Duplicate customerCode "${code}" found in CSV rows: ${rows.join(", ")}`);
    }
  });

  const [existingCustomersByPhone, existingCustomersByCode] = await Promise.all([
    customerRepository.findCustomersByPrimaryPhoneNumbers(clientId, Array.from(phoneToRowNumbers.keys())),
    customerRepository.findCustomersByCodes(clientId, Array.from(codeToRowNumbers.keys())),
  ]);

  // Report database duplicates
  existingCustomersByPhone.forEach((c: any) => {
    const rows = phoneToRowNumbers.get(c.primaryPhoneNumber);
    errors.push(`primaryPhoneNumber "${c.primaryPhoneNumber}" already exists in database (found in CSV row(s): ${rows?.join(", ")})`);
  });

  existingCustomersByCode.forEach((c: any) => {
    const rows = codeToRowNumbers.get(c.customerCode);
    errors.push(`customerCode "${c.customerCode}" already exists in database (found in CSV row(s): ${rows?.join(", ")})`);
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
      name: (data.name || data.Name || "").toString().trim(),
      email: (data.email || data.Email || "").toString().trim(),
      contactName: (data.contactName || data.ContactName || "").toString().trim() || null,
      printName: (data.printName || data.PrintName || "").toString().trim() || null,
      primaryPhoneNumber: (data.primaryPhoneNumber || data.PrimaryPhoneNumber || "").toString().trim(),
      secondaryPhoneNumber: (data.secondaryPhoneNumber || data.SecondaryPhoneNumber || "").toString().trim() || null,
      landlineNumber: (data.landlineNumber || data.LandlineNumber || "").toString().trim() || null,
      fax: (data.fax || data.Fax || "").toString().trim() || null,
      accEmail: (data.accEmail || data.AccEmail || "").toString().trim() || null,
      type: (data.type || data.Type || "").toString().trim() || null,
      priceLevel: (data.priceLevel || data.PriceLevel || "").toString().trim() || null,
      taxExempt: data.taxExempt === "true" || data.taxExempt === "1" || data.TaxExempt === "true" || data.TaxExempt === "1",
      salesTax: (data.salesTax || data.SalesTax || data.salesTaxId || data.SalesTaxId || "").toString().trim() || null,
      paymentTermId: data.paymentTermId ? Number(data.paymentTermId) : (data.PaymentTermId ? Number(data.PaymentTermId) : null),
      customerCode: (data.customerCode || data.CustomerCode || "").toString().trim() || null,
      internalNotes: (data.internalNotes || data.InternalNotes || "").toString().trim() || null,
      deliveryNotes: (data.deliveryNotes || data.DeliveryNotes || "").toString().trim() || null,
      status: ((data.status || data.Status || "active").toString().trim().toLowerCase() || "active") as "active" | "inactive",
      scopeId: data.scopeId ? Number(data.scopeId) : (data.ScopeId ? Number(data.ScopeId) : null),
      // Shipping address
      shippingAddress: data.shippingAddress || data.ShippingAddress || null,
      shippingAddressLine: data.shippingAddressLine || data.ShippingAddressLine || null,
      shippingLat: data.shippingLat ? parseFloat(data.shippingLat) : (data.ShippingLat ? parseFloat(data.ShippingLat) : null),
      shippingLong: data.shippingLong ? parseFloat(data.shippingLong) : (data.ShippingLong ? parseFloat(data.ShippingLong) : null),
      shippingContactName: data.shippingContactName || data.ShippingContactName || null,
      shippingContactEmail: data.shippingContactEmail || data.ShippingContactEmail || null,
      shippingContactNumber: data.shippingContactNumber || data.ShippingContactNumber || null,
      shippingCountryId: data.shippingCountryId ? Number(data.shippingCountryId) : (data.ShippingCountryId ? Number(data.ShippingCountryId) : null),
      // Remit address
      remitAddress: data.remitAddress || data.RemitAddress || null,
      remitAddressLine: data.remitAddressLine || data.RemitAddressLine || null,
      remitLat: data.remitLat ? parseFloat(data.remitLat) : (data.RemitLat ? parseFloat(data.RemitLat) : null),
      remitLong: data.remitLong ? parseFloat(data.remitLong) : (data.RemitLong ? parseFloat(data.RemitLong) : null),
      remitContactName: data.remitContactName || data.RemitContactName || null,
      remitContactEmail: data.remitContactEmail || data.RemitContactEmail || null,
      remitContactNumber: data.remitContactNumber || data.RemitContactNumber || null,
      remitCountryId: data.remitCountryId ? Number(data.remitCountryId) : (data.RemitCountryId ? Number(data.RemitCountryId) : null),
    };

    const validation = customerBulkUploadSchema.safeParse(inputData);

    if (!validation.success) {
      const rowErrors = validation.error.errors
        .map((err) => {
          const val = _.get(inputData, err.path);
          return `${err.path.join(".")}${val ? ` (value: "${val}")` : ""}: ${err.message}`;
        })
        .join(", ");
      errors.push(`Row ${rowNum}: ${rowErrors}`);
    } else {
      const { id: sTaxId, error: taxError } = mapSalesTaxToId({ salesTax: validation.data.salesTax });
      if (taxError) {
        errors.push(`Row ${rowNum}: ${taxError}`);
      } else {
        const { salesTax, ...rest } = validation.data;
        customers.push({ ...rest, salesTaxId: sTaxId, _rowNumber: rowNum });
      }
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
const ALLOWED_HEADERS = [
  "name", "Name",
  "email", "Email",
  "contactName", "ContactName",
  "printName", "PrintName",
  "primaryPhoneNumber", "PrimaryPhoneNumber",
  "secondaryPhoneNumber", "SecondaryPhoneNumber",
  "landlineNumber", "LandlineNumber",
  "fax", "Fax",
  "accEmail", "AccEmail",
  "type", "Type",
  "priceLevel", "PriceLevel",
  "taxExempt", "TaxExempt",
  "salesTax", "SalesTax",
  "salesTaxId", "SalesTaxId",
  "paymentTermId", "PaymentTermId",
  "customerCode", "CustomerCode",
  "internalNotes", "InternalNotes",
  "deliveryNotes", "DeliveryNotes",
  "status", "Status",
  "scopeId", "ScopeId",
  "shippingAddress", "ShippingAddress",
  "shippingAddressLine", "ShippingAddressLine",
  "shippingLat", "ShippingLat",
  "shippingLong", "ShippingLong",
  "shippingContactName", "ShippingContactName",
  "shippingContactEmail", "ShippingContactEmail",
  "shippingContactNumber", "ShippingContactNumber",
  "shippingCountryId", "ShippingCountryId",
  "remitAddress", "RemitAddress",
  "remitAddressLine", "RemitAddressLine",
  "remitLat", "RemitLat",
  "remitLong", "RemitLong",
  "remitContactName", "RemitContactName",
  "remitContactEmail", "RemitContactEmail",
  "remitContactNumber", "RemitContactNumber",
  "remitCountryId", "RemitCountryId",
];

const REQUIRED_HEADERS = ["name", "email", "primaryPhoneNumber", "customerCode"];

export const bulkUploadCustomers = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  let csvRows: any[] = [];
  let rowNumber = 1;

  // 1. Parse File (CSV or Excel)
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get headers
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    if (headers) {
      const unrecognized = headers.filter((h: string) => h && !ALLOWED_HEADERS.includes(h));
      if (unrecognized.length > 0) {
        throw new AppError(`Unrecognized column(s) in file: ${unrecognized.join(", ")}`, 400);
      }

      const missing = REQUIRED_HEADERS.filter((rh) => {
        const capitalized = rh.charAt(0).toUpperCase() + rh.slice(1);
        return !headers.includes(rh) && !headers.includes(capitalized);
      });
      if (missing.length > 0) {
        throw new AppError(`Required column(s) missing: ${missing.join(", ")}`, 400);
      }
    }

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    csvRows = data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to parse file: ${error.message}`, 400);
  }

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
        lat: shippingLat || null,
        long: shippingLong || null,
        contactName: shippingContactName || null,
        contactEmail: shippingContactEmail || null,
        contactNumber: shippingContactNumber || null,
        countryId: shippingCountryId || null,
        addressType: CUSTOMER_ADDRESS_TYPES.SHIPPING,
        isPrimary: true,
        clientId,
      });
    }

    // Remit address
    if (remitAddress && String(remitAddress).trim()) {
      addresses.push({
        address: String(remitAddress).trim(),
        addressLine: remitAddressLine || null,
        lat: remitLat || null,
        long: remitLong || null,
        contactName: remitContactName || null,
        contactEmail: remitContactEmail || null,
        contactNumber: remitContactNumber || null,
        countryId: remitCountryId || null,
        addressType: CUSTOMER_ADDRESS_TYPES.REMIT,
        isPrimary: true,
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

    let parentLedger = await ledgerAccountRepository.getLedgerAccountByFilter({
      key: "account_receivable",
      clientId,
    }, transaction);

    if (!parentLedger) {
      parentLedger = await ledgerAccountRepository.createLedgerAccount({
        name: "Account Receivable",
        key: "account_receivable",
        subHeaderId,
        clientId,
        type: LEDGER_ACCOUNT_TYPES.DEBIT,
        openingBalance: 0,
        openingDate: new Date(),
      }, transaction);
    }

    const ledgerAccountsToCreate: any[] = createdCustomers.map((customer: any) => ({
      name: customer.name,
      subHeaderId,
      clientId,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
      referenceId: customer.id,
      parentId: parentLedger.id,
    }));

    // 9. Bulk create ledger accounts
    await ledgerAccountRepository.bulkCreateLedgerAccountsForBulkUpload(ledgerAccountsToCreate, transaction);

    return { createdCustomersCount: createdCustomers.length };
  });

  return result;
};

// Get merged standard + external AR invoices paginated
export const getCustomerARInvoices = async (
  customerId: number,
  clientId: number,
  page: number,
  limit: number
) => {
  // 1. Fetch standard overdue invoices
  const standardOverdue = await salesOrderInvoiceService.getOverdueInvoices(clientId, customerId);

  // 2. Fetch external invoices/transactions
  const externalTransactions: any[] = await CustomerTransaction.findAll({
    where: { clientId, customerId },
    raw: true,
  });

  // 3. Format/Normalize both sets into a unified structure
  const unifiedInvoices: any[] = [];

  // Map standard invoices
  for (const inv of standardOverdue) {
    unifiedInvoices.push({
      id: `std_${inv.id}`,
      invoiceNo: inv.invoiceCode || "--",
      invoiceDate: inv.createdAt, // Invoice Date
      dueDate: inv.dueDate,
      totalAmount: inv.finalAmount,
      paidAmount: inv.paidAmount,
      balanceAmount: inv.balanceAmount,
      isExternal: false,
    });
  }

  // Map external transactions
  for (const inv of externalTransactions) {
    unifiedInvoices.push({
      id: `ext_${inv.id}`,
      invoiceNo: inv.invoiceNo || "--",
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.balanceDue, // external transactions only track outstanding balance
      paidAmount: 0,
      balanceAmount: inv.balanceDue,
      isExternal: true,
    });
  }

  // 4. Sort unified list by invoiceDate DESC (newest first)
  unifiedInvoices.sort((a, b) => {
    const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
    const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
    return dateB - dateA;
  });

  // 5. Paginate/slice the merged array
  const offset = (page - 1) * limit;
  const paginatedRows = unifiedInvoices.slice(offset, offset + limit);

  return {
    rows: paginatedRows,
    total: unifiedInvoices.length,
    page,
    limit,
  };
};

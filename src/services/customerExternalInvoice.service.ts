import * as XLSX from "xlsx";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as invoiceRepo from "../repositories/customerExternalInvoice.repository";
import * as models from "../models";
import { AppError } from "../helper/appError";
import _ from "lodash";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { COA_SUB_HEADERS, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";

const parseExcelDate = (val: any) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  const num = parseFloat(val);
  if (!isNaN(num)) {
    // Excel date epoch starts on 1899-12-30 (due to 1900 leap year bug in Lotus 1-2-3)
    return new Date((num - 25569) * 86400 * 1000);
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  return null;
};

const normalizeProductName = (name: string): string => {
  if (!name) return "";
  return String(name).split(/\s+aka\b:?\s*/i)[0].trim().toLowerCase();
};

const ALLOWED_HEADERS = [
  "Customer", "customer",
  "Product", "product",
  "Item", "item",
  "Sold As", "soldAs",
  "SKU", "sku",
  "Item Type", "itemType",
  "Line Type", "lineType",
  "Category", "category",
  "Sub Category", "subCategory",
  "Group", "group",
  "Price Range", "priceRange",
  "Series Name", "seriesName",
  "Kind", "kind",
  "Transaction#", "transactionNo",
  "Invoice#", "invoiceNo",
  "Date", "date",
  "Job Name", "jobName",
  "Location", "location",
  "Sales Person1", "salesPerson1",
  "Sales Person2", "salesPerson2",
  "Proj. Manager", "projManager",
  "Acct. Type", "acctType",
  "Acct. Name", "acctName",
  "Code", "code",
  "Customer Zone", "customerZone",
  "Ship To Party Name", "shipToPartyName",
  "Ship To City", "shipToCity",
  "Ship To State", "shipToState",
  "Ship To Zip", "shipToZip",
  "Cust.Type", "custType",
  "Associates", "associates",
  "Delivery Type", "deliveryType",
  "Slabs",
  "Inv. Qty", "invQty",
  "UOM", "uom",
  "Sale Total", "saleTotal",
  "Total Cost", "totalCost",
  "Margin", "margin",
  "Margin %", "marginPercentage",
  "Tax", "tax",
  "TaxRate", "taxRate"
];

const parseExcelFile = (fileBuffer: Buffer): any[] => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Validate headers
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    if (headers) {
      const hasCustomer = headers.includes("Customer") || headers.includes("customer");
      const hasItem = headers.includes("Item") || headers.includes("item") || headers.includes("Product") || headers.includes("product");

      const missing: string[] = [];
      if (!hasCustomer) missing.push("Customer");
      if (!hasItem) missing.push("Item/Product");

      if (missing.length > 0) {
        throw new AppError(`Missing required column(s): ${missing.join(", ")}`, 400);
      }

      // Check for unrecognized headers but DO NOT throw error (unlike bulk product upload)
      const unrecognized = headers.filter((h: string) => h && !ALLOWED_HEADERS.includes(h));
      if (unrecognized.length > 0) {
        console.log(`Ignoring unrecognized column(s) in standard external invoice upload: ${unrecognized.join(", ")}`);
      }
    }

    const data = XLSX.utils.sheet_to_json(worksheet);
    let rowNumber = 1;
    return data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to parse file: ${error.message}`, 400);
  }
};

const cleanCustomerName = (name: string): string => {
  if (!name) return "";
  return name
    .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractCustomerNames = (csvRows: any[]): Map<string, string> => {
  const customerNamesMap = new Map<string, string>(); // lowercase -> original casing
  csvRows.forEach((row) => {
    const customerVal = row["Customer"] !== undefined ? row["Customer"] : row["customer"];
    if (customerVal !== undefined && customerVal !== null) {
      const nameStr = cleanCustomerName(String(customerVal));
      if (nameStr) {
        customerNamesMap.set(nameStr.toLowerCase(), nameStr);
      }
    }
  });
  return customerNamesMap;
};

const queryProductsAndCustomers = async (clientId: number, uniqueCustomerNames: string[]) => {
  const [products, customers] = await Promise.all([
    models.Product.findAll({
      where: { clientId },
      attributes: ["id", "name"],
    }),
    models.Customer.findAll({
      where: {
        clientId,
        name: uniqueCustomerNames,
      },
      attributes: ["id", "name"],
    }),
  ]);
  return { products, customers };
};

const createMissingCustomersAndLedgers = async (
  missingCustomerNames: string[],
  clientId: number,
  userId: number,
  customerMap: Map<string, number>,
  transaction: Transaction
) => {
  if (missingCustomerNames.length === 0) return;

  // Fetch the max customerCode for this client once under transaction lock
  const maxCodeResult: any = await models.Customer.findOne({
    attributes: [[sequelize.fn("MAX", sequelize.cast(sequelize.col("customerCode"), "UNSIGNED")), "maxCode"]],
    where: { clientId },
    raw: true,
    transaction,
  });

  let nextCode = 1;
  if (maxCodeResult && maxCodeResult.maxCode) {
    nextCode = parseInt(maxCodeResult.maxCode) + 1;
  }

  // Pre-calculate sequential customerCode to prevent bulkCreate parallel validation hook duplicate race condition
  const newCustomersData = missingCustomerNames.map((name, index) => ({
    name,
    clientId,
    customerCode: String(nextCode + index),
    createdBy: userId,
    updatedBy: userId,
  }));

  const createdCustomers = await models.Customer.bulkCreate(newCustomersData, {
    transaction,
    validate: true,
    individualHooks: true,
  });

  // Prepare and bulk create ledger accounts for the new customers
  const subHeaderId = COA_SUB_HEADERS.find((e) => e.key == "accounts_notes_loans_receivable")?.id;
  if (!subHeaderId) {
    throw new AppError("Ledger account sub-header not found.", 500);
  }

  let parentLedger = await ledgerAccountRepository.getLedgerAccountByFilterForBulkUpload({
    key: "account_receivable",
    clientId,
  }, transaction);

  if (!parentLedger) {
    parentLedger = await ledgerAccountRepository.createLedgerAccountForBulkUpload({
      name: "Account Receivable",
      key: "account_receivable",
      subHeaderId,
      clientId,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      openingBalance: 0,
      openingDate: new Date(),
    }, transaction);
  }

  const ledgerAccountsToCreate = createdCustomers.map((customer: any) => ({
    name: customer.name,
    subHeaderId,
    clientId,
    type: LEDGER_ACCOUNT_TYPES.DEBIT,
    referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    referenceId: customer.id,
    parentId: parentLedger.id,
  }));

  await ledgerAccountRepository.bulkCreateLedgerAccountsForBulkUpload(ledgerAccountsToCreate, transaction);

  // Add the new customers to our customerMap so they can be referenced
  createdCustomers.forEach((customer: any) => {
    customerMap.set(cleanCustomerName(customer.name).toLowerCase(), customer.id);
  });
};

const validateAndBuildInvoices = (
  csvRows: any[],
  productMap: Map<string, number>,
  customerMap: Map<string, number>,
  clientId: number,
  errors: string[]
): any[] => {
  const invoicesToCreate: any[] = [];

  csvRows.forEach((row) => {
    const itemVal = row["product"] !== undefined ? row["product"] : (row["Product"] !== undefined ? row["Product"] : (row["Item"] !== undefined ? row["Item"] : row["item"]));
    const itemStr = itemVal !== undefined && itemVal !== null ? String(itemVal).trim() : "";
    
    const customerVal = row["Customer"] !== undefined ? row["Customer"] : row["customer"];
    const customerStr = customerVal !== undefined && customerVal !== null ? String(customerVal).trim() : "";

    const normalizedItem = normalizeProductName(itemStr);
    const isSpecialItem =
      normalizedItem === "delivery" ||
      normalizedItem === "discount" ||
      normalizedItem === "fabrication & installation" ||
      normalizedItem === "finance charge";
    const productId = isSpecialItem ? null : (normalizedItem ? productMap.get(normalizedItem) : undefined);
    const customerId = customerMap.get(cleanCustomerName(customerStr).toLowerCase());

    if (!isSpecialItem && !productId && itemStr) {
      errors.push(`Row ${row._rowNumber}: Product "${itemStr}" does not exist in the system.`);
    }

    if (!customerId && customerStr) {
      errors.push(`Row ${row._rowNumber}: Customer "${customerStr}" does not exist in the system.`);
    }

    if (errors.length > 50) {
      // Limit to first 50 errors for user readability
      return;
    }

    if ((productId || isSpecialItem) && customerId) {
      invoicesToCreate.push({
        productId: productId || null,
        customerId,
        clientId,
        invoiceType: isSpecialItem ? normalizedItem : "sale",
        item: itemStr || null,
        soldAs: row["Sold As"] || row["soldAs"] || null,
        sku: row["SKU"] || row["sku"] || null,
        itemType: row["Item Type"] || row["itemType"] || null,
        lineType: row["Line Type"] || row["lineType"] || null,
        category: row["Category"] || row["category"] || null,
        subCategory: row["Sub Category"] || row["subCategory"] || null,
        group: row["Group"] || row["group"] || null,
        priceRange: row["Price Range"] || row["priceRange"] || null,
        seriesName: row["Series Name"] || row["seriesName"] || null,
        kind: row["Kind"] || row["kind"] || null,
        transactionNo: row["Transaction#"] || row["transactionNo"] || null,
        invoiceNo: row["Invoice#"] || row["invoiceNo"] || null,
        invoiceDate: parseExcelDate(row["Date"] || row["date"]),
        jobName: row["Job Name"] || row["jobName"] || null,
        location: row["Location"] || row["location"] || null,
        salesPerson1: row["Sales Person1"] || row["salesPerson1"] || null,
        salesPerson2: row["Sales Person2"] || row["salesPerson2"] || null,
        projManager: row["Proj. Manager"] || row["projManager"] || null,
        acctType: row["Acct. Type"] || row["acctType"] || null,
        acctName: row["Acct. Name"] || row["acctName"] || null,
        customer: customerStr || null,
        code: row["Code"] || row["code"] || null,
        customerZone: row["Customer Zone"] || row["customerZone"] || null,
        shipToPartyName: row["Ship To Party Name"] || row["shipToPartyName"] || null,
        shipToCity: row["Ship To City"] || row["shipToCity"] || null,
        shipToState: row["Ship To State"] || row["shipToState"] || null,
        shipToZip: row["Ship To Zip"] || row["shipToZip"] || null,
        custType: row["Cust.Type"] || row["custType"] || null,
        associates: row["Associates"] || row["associates"] || null,
        deliveryType: row["Delivery Type"] || row["deliveryType"] || null,
        slabs: row["Slabs"] !== undefined ? String(row["Slabs"]) : null,
        invQty: parseFloat(row["Inv. Qty"] || row["invQty"]) || 0,
        uom: row["UOM"] || row["uom"] || null,
        saleTotal: parseFloat(row["Sale Total"] || row["saleTotal"]) || 0,
        totalCost: parseFloat(row["Total Cost"] || row["totalCost"]) || 0,
        margin: parseFloat(row["Margin"] || row["margin"]) || 0,
        marginPercentage: parseFloat(row["Margin %"] || row["marginPercentage"]) || 0,
        tax: parseFloat(row["Tax"] || row["tax"]) || 0,
        taxRate: parseFloat(row["TaxRate"] || row["taxRate"]) || 0,
      });
    }
  });

  return invoicesToCreate;
};

export const bulkUploadCustomerExternalInvoices = async (fileBuffer: Buffer, clientId: number, userId: number) => {
  // 1. Parse File
  const csvRows = parseExcelFile(fileBuffer);
  if (csvRows.length === 0) {
    throw new AppError("No data found in the file.", 400);
  }

  // 2. Extract Customer Names
  const customerNamesMap = extractCustomerNames(csvRows);
  const uniqueCustomerNames = Array.from(customerNamesMap.values());

  // 3. Batch query existing Products & Customers
  const { products, customers } = await queryProductsAndCustomers(clientId, uniqueCustomerNames);

  // 4. Map Products (with AKA suffix normalization logic)
  const productMap = new Map<string, number>();
  products.forEach((p: any) => {
    const normalized = normalizeProductName(p.name);
    if (normalized) {
      const existingId = productMap.get(normalized);
      if (!existingId || !p.name.toLowerCase().includes("aka")) {
        productMap.set(normalized, p.id);
      }
    }
  });

  // 5. Map existing Customers
  const customerMap = new Map<string, number>(
    customers.map((c: any) => [cleanCustomerName(c.name).toLowerCase(), c.id])
  );

  // 6. Find missing Customer Names
  const missingCustomerNames: string[] = [];
  for (const [lowerName, origName] of customerNamesMap.entries()) {
    if (!customerMap.has(lowerName)) {
      missingCustomerNames.push(origName);
    }
  }

  const errors: string[] = [];

  // 7. Bulk process in a single transaction
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    // 7a. Auto-create missing customers and their ledger accounts (with sequential customerCode generation)
    await createMissingCustomersAndLedgers(missingCustomerNames, clientId, userId, customerMap, transaction);

    // 7b. Validate and build invoice objects to create
    const invoicesToCreate = validateAndBuildInvoices(csvRows, productMap, customerMap, clientId, errors);

    if (errors.length > 0) {
      throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
    }

    if (invoicesToCreate.length === 0) {
      return { createdCount: 0, message: "No valid rows found to upload." };
    }

    // 7c. Bulk create external invoices
    const createdInvoices = await invoiceRepo.bulkCreateCustomerExternalInvoices(invoicesToCreate, transaction);
    return { createdCount: createdInvoices.length };
  });

  return result;
};

export const fetchAllCustomerExternalInvoices = async (
  page: number,
  limit: number,
  clientId: number,
  search?: string,
  filters?: any
) => {
  const offset = (page - 1) * limit;
  const { transactions, total } = await invoiceRepo.findAllCustomerExternalInvoices(
    offset,
    limit,
    clientId,
    search,
    filters
  );

  return {
    transactions,
    total,
    page,
    limit,
  };
};

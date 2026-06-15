import * as XLSX from "xlsx";
import { Transaction, Op } from "sequelize";
import { sequelize } from "../config/database";
import * as agedInvoiceRepo from "../repositories/customerExternalAgedInvoice.repository";
import * as customerRepo from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import _ from "lodash";
import * as models from "../models";
import { createMissingCustomersAndLedgers, cleanCustomerName } from "./customerExternalInvoice.service";

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

const ALLOWED_HEADERS = [
  "Customer Code", "customerCode",
  "Customer", "customer", "Customer Name", "customerName",
  "Trx. Type", "trxType",
  "Cust. Type", "custType",
  "Transaction#", "transactionNo",
  "Invoice#", "invoiceNo",
  "Location", "location",
  "Cust. PO#", "custPoNo",
  "Job Name", "jobName",
  "Terms", "terms",
  "Invoice Dt.", "Invoice Date", "invoiceDt", "invoiceDate",
  "Days Past InvoiceDt", "daysPastInvoiceDate", "Days Past Invoice Dt",
  "Due Dt.", "Due Date", "dueDt", "dueDate",
  "Days Pastdue", "daysPastDue", "Days Past Due",
  "0 - 30", "aging0To30",
  "31 - 45", "aging31To45",
  "46 - 60", "aging46To60",
  "Over 60", "agingOver60",
  "Balance Due", "balanceDue",
  "Internal Notes", "internalNotes"
];

export const bulkUploadCustomerExternalAgedInvoices = async (fileBuffer: Buffer, clientId: number, userId: number) => {
  let csvRows: any[] = [];
  let rowNumber = 1;

  // 1. Parse File (CSV or Excel)
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Validate headers
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    if (headers) {
      const hasCustomerCode = headers.includes("Customer Code") || headers.includes("customerCode") || headers.includes("Customer") || headers.includes("customer");
      if (!hasCustomerCode) {
        throw new AppError("Missing required column: Customer Code or Customer", 400);
      }

      // Check for unrecognized headers but DO NOT throw error (unlike bulk product upload)
      const unrecognized = headers.filter((h: string) => h && !ALLOWED_HEADERS.includes(h));
      if (unrecognized.length > 0) {
        console.log(`Ignoring unrecognized column(s) in aged external invoice upload: ${unrecognized.join(", ")}`);
      }
    }

    const data = XLSX.utils.sheet_to_json(worksheet);
    csvRows = data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to parse file: ${error.message}`, 400);
  }

  if (csvRows.length === 0) {
    throw new AppError("No data found in the file.", 400);
  }

  // 2. Extract unique customer codes and names
  const codes = new Set<string>();
  const names = new Set<string>();

  csvRows.forEach((row) => {
    const codeVal = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
    if (codeVal !== undefined && codeVal !== null) {
      codes.add(String(codeVal).trim());
    }

    const nameVal = row["Customer"] !== undefined ? row["Customer"] : (row["customer"] !== undefined ? row["customer"] : (row["Customer Name"] !== undefined ? row["Customer Name"] : row["customerName"]));
    if (nameVal !== undefined && nameVal !== null) {
      names.add(cleanCustomerName(String(nameVal)));
    }
  });

  const searchCodes = Array.from(codes).filter(Boolean);
  const searchNames = Array.from(names).filter(Boolean);

  // 3. Find existing customers in system by name or code
  const existingCustomers = await models.Customer.findAll({
    where: {
      clientId,
      [Op.or]: [
        { customerCode: [...searchCodes, ...searchNames] },
        { name: [...searchCodes, ...searchNames] }
      ]
    }
  });

  const customerMap = new Map<string, number>();
  existingCustomers.forEach((c: any) => {
    if (c.customerCode) {
      customerMap.set(String(c.customerCode).trim().toLowerCase(), c.id);
    }
    if (c.name) {
      customerMap.set(cleanCustomerName(c.name).toLowerCase(), c.id);
    }
  });

  // 4. Find missing Customer Names
  const missingCustomerNamesMap = new Map<string, string>(); // lowercase -> original casing
  csvRows.forEach((row) => {
    const codeVal = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
    const code = codeVal !== undefined && codeVal !== null ? String(codeVal).trim() : "";
    const nameVal = row["Customer"] !== undefined ? row["Customer"] : (row["customer"] !== undefined ? row["customer"] : (row["Customer Name"] !== undefined ? row["Customer Name"] : row["customerName"]));
    const name = nameVal !== undefined && nameVal !== null ? cleanCustomerName(String(nameVal)) : "";

    let customerId = null;
    if (code) {
      customerId = customerMap.get(code.toLowerCase());
    }
    if (!customerId && name) {
      customerId = customerMap.get(name.toLowerCase());
    }

    if (!customerId) {
      const resolvedName = name || code;
      if (resolvedName) {
        missingCustomerNamesMap.set(resolvedName.toLowerCase(), resolvedName);
      }
    }
  });

  const missingCustomerNames = Array.from(missingCustomerNamesMap.values());

  const errors: string[] = [];
  const transactionsToCreate: any[] = [];

  // 5. Run in transaction
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    // 5a. Auto-create missing customers (and ledger accounts)
    await createMissingCustomersAndLedgers(missingCustomerNames, clientId, userId, customerMap, transaction);

    // 5b. Prepare transactions to create
    csvRows.forEach((row) => {
      const codeVal = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
      const code = codeVal !== undefined && codeVal !== null ? String(codeVal).trim() : "";
      const nameVal = row["Customer"] !== undefined ? row["Customer"] : (row["customer"] !== undefined ? row["customer"] : (row["Customer Name"] !== undefined ? row["Customer Name"] : row["customerName"]));
      const name = nameVal !== undefined && nameVal !== null ? cleanCustomerName(String(nameVal)) : "";

      if (!code && !name) {
        // Skip row if no customer code or name exists in the row
        return;
      }

      let customerId = null;
      if (code) {
        customerId = customerMap.get(code.toLowerCase());
      }
      if (!customerId && name) {
        customerId = customerMap.get(name.toLowerCase());
      }

      if (!customerId) {
        errors.push(`Row ${row._rowNumber}: Customer "${name || code}" could not be resolved or created.`);
        return;
      }

      const rawInvoiceDate = row["Invoice Dt."] || row["Invoice Date"] || row["invoiceDt"] || row["invoiceDate"];
      const parsedInvoiceDate = parseExcelDate(rawInvoiceDate);

      const rawDueDate = row["Due Dt."] || row["Due Date"] || row["dueDt"] || row["dueDate"];
      const parsedDueDate = parseExcelDate(rawDueDate);

      transactionsToCreate.push({
        customerId,
        customerCode: code || null,
        trxType: row["Trx. Type"] || row["trxType"] || null,
        custType: row["Cust. Type"] || row["custType"] || null,
        transactionNo: row["Transaction#"] || row["transactionNo"] || null,
        invoiceNo: row["Invoice#"] || row["invoiceNo"] || null,
        location: row["Location"] || row["location"] || null,
        custPoNo: row["Cust. PO#"] || row["custPoNo"] || null,
        jobName: row["Job Name"] || row["jobName"] || null,
        terms: row["Terms"] || row["terms"] || null,
        invoiceDate: parsedInvoiceDate,
        daysPastInvoiceDate: null,
        dueDate: parsedDueDate,
        daysPastDue: null,
        aging0To30: parseFloat(row["0 - 30"] || row["aging0To30"]) || 0,
        aging31To45: parseFloat(row["31 - 45"] || row["aging31To45"]) || 0,
        aging46To60: parseFloat(row["46 - 60"] || row["aging46To60"]) || 0,
        agingOver60: parseFloat(row["Over 60"] || row["agingOver60"]) || 0,
        balanceDue: parseFloat(row["Balance Due"] || row["balanceDue"]) || 0,
        internalNotes: row["Internal Notes"] || row["internalNotes"] || null,
        clientId,
      });
    });

    if (errors.length > 0) {
      throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
    }

    if (transactionsToCreate.length === 0) {
      return [];
    }

    return await agedInvoiceRepo.bulkCreateCustomerExternalAgedInvoices(transactionsToCreate, transaction);
  });

  return { createdCount: result.length };
};

export const fetchAllCustomerExternalAgedInvoices = async (
  page: number,
  limit: number,
  clientId: number,
  search?: string,
  filters?: any
) => {
  const offset = (page - 1) * limit;
  const { transactions, total } = await agedInvoiceRepo.findAllCustomerExternalAgedInvoices(
    offset,
    limit,
    clientId,
    search,
    filters
  );

  const transactionsWithCalculatedDays = transactions.map((trx: any) => {
    const data = trx.toJSON ? trx.toJSON() : trx;
    const today = new Date();
    const todayDateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    if (data.dueDate) {
      const parsedDueDate = new Date(data.dueDate);
      const dueDateOnly = new Date(Date.UTC(parsedDueDate.getFullYear(), parsedDueDate.getMonth(), parsedDueDate.getDate()));
      const diffTime = todayDateOnly.getTime() - dueDateOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      data.daysPastDue = diffDays > 0 ? diffDays : 0;
    } else {
      data.daysPastDue = null;
    }

    if (data.invoiceDate) {
      const parsedInvoiceDate = new Date(data.invoiceDate);
      const invoiceDateOnly = new Date(Date.UTC(parsedInvoiceDate.getFullYear(), parsedInvoiceDate.getMonth(), parsedInvoiceDate.getDate()));
      const diffTime = todayDateOnly.getTime() - invoiceDateOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      data.daysPastInvoiceDate = diffDays > 0 ? diffDays : 0;
    } else {
      data.daysPastInvoiceDate = null;
    }

    return data;
  });

  return {
    transactions: transactionsWithCalculatedDays,
    total,
    page,
    limit,
  };
};

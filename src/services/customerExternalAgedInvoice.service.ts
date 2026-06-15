import * as XLSX from "xlsx";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as agedInvoiceRepo from "../repositories/customerExternalAgedInvoice.repository";
import * as customerRepo from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import _ from "lodash";

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

export const bulkUploadCustomerExternalAgedInvoices = async (fileBuffer: Buffer, clientId: number) => {
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
      const hasCustomerCode = headers.includes("Customer Code") || headers.includes("customerCode");
      if (!hasCustomerCode) {
        throw new AppError("Missing required column: Customer Code", 400);
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

  // 2. Extract unique customer codes
  const customerCodes = csvRows
    .map((row) => {
      const code = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
      return code !== undefined && code !== null ? String(code).trim() : "";
    })
    .filter(Boolean);
  
  // 3. Find customers by codes
  const customers = await customerRepo.findCustomersByCodes(clientId, customerCodes);
  const customerMap = new Map(customers.map((c: any) => [String(c.customerCode).trim(), c.id]));

  // 4. Prepare data for insertion
  const errors: string[] = [];
  const transactionsToCreate: any[] = [];

  csvRows.forEach((row) => {
    const rawCode = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
    const code = rawCode !== undefined && rawCode !== null ? String(rawCode).trim() : "";

    if (!code) {
      // Skip row if customer code does not exist in the row (e.g. blank rows)
      return;
    }

    const customerId = customerMap.get(code);

    if (!customerId) {
      errors.push(`Row ${row._rowNumber}: Customer with code "${code}" does not exist in the system.`);
      return;
    }
    const rawInvoiceDate = row["Invoice Dt."] || row["Invoice Date"] || row["invoiceDt"] || row["invoiceDate"];
    const parsedInvoiceDate = parseExcelDate(rawInvoiceDate);

    const rawDueDate = row["Due Dt."] || row["Due Date"] || row["dueDt"] || row["dueDate"];
    const parsedDueDate = parseExcelDate(rawDueDate);

    transactionsToCreate.push({
      customerId,
      customerCode: code,
      trxType: row["Trx. Type"] || row["trxType"],
      custType: row["Cust. Type"] || row["custType"],
      transactionNo: row["Transaction#"] || row["transactionNo"],
      invoiceNo: row["Invoice#"] || row["invoiceNo"],
      location: row["Location"] || row["location"],
      custPoNo: row["Cust. PO#"] || row["custPoNo"],
      jobName: row["Job Name"] || row["jobName"],
      terms: row["Terms"] || row["terms"],
      invoiceDate: parsedInvoiceDate,
      daysPastInvoiceDate: null,
      dueDate: parsedDueDate,
      daysPastDue: null,
      aging0To30: parseFloat(row["0 - 30"] || row["aging0To30"]) || 0,
      aging31To45: parseFloat(row["31 - 45"] || row["aging31To45"]) || 0,
      aging46To60: parseFloat(row["46 - 60"] || row["aging46To60"]) || 0,
      agingOver60: parseFloat(row["Over 60"] || row["agingOver60"]) || 0,
      balanceDue: parseFloat(row["Balance Due"] || row["balanceDue"]) || 0,
      internalNotes: row["Internal Notes"] || row["internalNotes"],
      clientId,
    });
  });

  if (errors.length > 0) {
    throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
  }

  if (transactionsToCreate.length === 0) {
    return { createdCount: 0, message: "No valid rows found to upload." };
  }

  // 5. Bulk create in transaction
  const result = await sequelize.transaction(async (transaction: Transaction) => {
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

  return {
    transactions,
    total,
    page,
    limit,
  };
};

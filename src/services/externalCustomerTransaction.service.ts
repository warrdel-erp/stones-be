import * as XLSX from "xlsx";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as externalTransactionRepo from "../repositories/externalCustomerTransaction.repository";
import * as customerRepo from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import _ from "lodash";

export const bulkUploadExternalTransactions = async (fileBuffer: Buffer, clientId: number) => {
  let csvRows: any[] = [];
  let rowNumber = 1;

  // 1. Parse File (CSV or Excel)
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    csvRows = data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));
  } catch (error: any) {
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
  let skippedCount = 0;
  const transactionsToCreate: any[] = [];

  csvRows.forEach((row) => {
    const rawCode = row["Customer Code"] !== undefined ? row["Customer Code"] : row["customerCode"];
    const code = rawCode !== undefined && rawCode !== null ? String(rawCode).trim() : "";
    const customerId = customerMap.get(code);

    if (!customerId) {
      skippedCount++;
      return;
    }

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
      invoiceDate: row["Invoice Dt."] ? new Date(row["Invoice Dt."]) : null,
      daysPastInvoiceDate: parseInt(row["Days Past InvoiceDt"] || row["daysPastInvoiceDate"]) || 0,
      dueDate: row["Due Dt."] ? new Date(row["Due Dt."]) : null,
      daysPastDue: parseInt(row["Days Pastdue"] || row["daysPastDue"]) || 0,
      aging0To30: parseFloat(row["0 - 30"] || row["aging0To30"]) || 0,
      aging31To45: parseFloat(row["31 - 45"] || row["aging31To45"]) || 0,
      aging46To60: parseFloat(row["46 - 60"] || row["aging46To60"]) || 0,
      agingOver60: parseFloat(row["Over 60"] || row["agingOver60"]) || 0,
      balanceDue: parseFloat(row["Balance Due"] || row["balanceDue"]) || 0,
      internalNotes: row["Internal Notes"] || row["internalNotes"],
      clientId,
    });
  });

  if (transactionsToCreate.length === 0) {
    return { createdCount: 0, skippedCount, message: "No valid rows found to upload." };
  }

  // 5. Bulk create in transaction
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    return await externalTransactionRepo.bulkCreateExternalTransactions(transactionsToCreate, transaction);
  });

  return { createdCount: result.length, skippedCount };
};

export const fetchAllExternalTransactions = async (
  page: number,
  limit: number,
  clientId: number,
  search?: string,
  filters?: any
) => {
  const offset = (page - 1) * limit;
  const { transactions, total } = await externalTransactionRepo.findAllExternalTransactions(
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

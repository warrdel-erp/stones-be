import csv from "csv-parser";
import { Readable } from "stream";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as externalTransactionRepo from "../repositories/externalCustomerTransaction.repository";
import * as customerRepo from "../repositories/customer.repository";
import { AppError } from "../helper/appError";

export const bulkUploadExternalTransactions = async (fileBuffer: Buffer, clientId: number) => {
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
    throw new AppError("No data found in the CSV file.", 400);
  }

  // 2. Extract unique customer codes
  const customerCodes = csvRows.map(row => row["Customer Code"] || row["customerCode"]).filter(Boolean);
  
  // 3. Find customers by codes
  const customers = await customerRepo.findCustomersByCodes(clientId, customerCodes);
  const customerMap = new Map(customers.map((c: any) => [c.customerCode, c.id]));

  // 4. Prepare data for insertion
  const transactionsToCreate = csvRows.map((row) => {
    const code = row["Customer Code"] || row["customerCode"];
    const customerId = customerMap.get(code);

    if (!customerId) {
       // Optional: you might want to skip or throw error if customer not found
       // For now, let's skip or throw based on preference. User said "recognized by customerCode".
       // I'll throw error to be safe.
       throw new AppError(`Customer with code ${code} not found in database.`, 400);
    }

    return {
      customerId,
      customerCode: code,
      trxType: row["Trx. Type"] || row["trxType"],
      custType: row["Cust. Type"] || row["custType"],
      transactionNo: row["Transaction#"] || row["transactionNo"],
      invoiceNo: row["Invoice#"] || row["invoiceNo"],
      location: row["Location"] || row["location"],
      custPoNo: row["Cust. PO#"] || row["custPoNo"],
      jobName: row["Job Name"] || row["jobName"],
      // salesRepId: ... (Sales Rep is also likely a name in Excel, would need lookup if it's an ID)
      // For now, mapping name to salesRep if the model supported it, but it's an ID.
      // I'll leave salesRepId as null unless we have a mapping.
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
    };
  });

  // 5. Bulk create in transaction
  const result = await sequelize.transaction(async (transaction: Transaction) => {
    return await externalTransactionRepo.bulkCreateExternalTransactions(transactionsToCreate, transaction);
  });

  return { createdCount: result.length };
};

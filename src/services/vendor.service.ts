import { AppError } from "../helper/appError";
import csv from "csv-parser";
import { Readable } from "stream";
import { vendorBulkUploadSchema } from "../validators/vendor.validator";
import * as vendorRepository from "../repositories/vendor.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as billService from "../services/bill.service";
import * as siplService from "../services/sipl.service";
import { type LedgerAccount } from "../models/ledgerAccount.model";
import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import {
  BILL_REFERENCE_TYPES,
  LEDGER_ACCOUNT_REFERENCE_TYPES,
  PAYMENT_BILL_REFERENCE_TYPES,
} from "../constants/tableTypes";
import { sequelize } from "../config/database";
import { WhereOptions } from "sequelize";
import { PAYMENT_TERMS, SCOP } from "../constants";
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import _ from "lodash";

// Service function to create a vendor.
export const registerVendor = async (vendorData: any, clientId: number) => {
  const transaction = await sequelize.transaction();
  try {
    if (!vendorData.name || !vendorData.email) {
      throw new Error("Name, and Email are required fields.");
    }

    // Create vendor
    const newVendor: any = await vendorRepository.createVendor({ ...vendorData, clientId }, transaction);

    // Create Ledger Account data
    const ledgerAccountData: LedgerAccount = {
      name: newVendor.name,
      clientId,
      subHeaderId: COA_SUB_HEADERS.find((e) => e.key == "trade_payables")?.id!,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR,
      referenceId: newVendor.id,
    };

    const ledgerAccount = await ledgerAccountRepository.createLedgerAccount(ledgerAccountData, transaction);

    transaction.commit();
    return { vendor: newVendor, ledgerAccount };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Update vendor
export const updateVendor = async (id: number, data: any) => {
  const updatedVendor = await vendorRepository.updateVendorById(id, data);
  if (!updatedVendor) throw new AppError("Vendor not found or update failed", 400);

  return updatedVendor;
};

// Get all vendors with pagination.
export const fetchAllVendors = async (page: number, limit: number, filter?: WhereOptions) => {
  const vendors = await vendorRepository.getAllVendors(page, limit, filter);

  vendors.vendors = vendors.vendors.map((vendor: any) => {
    vendor = vendor.get({ plain: true });
    vendor.vendorScope = SCOP.find((k) => k.id == vendor.vendorScope)?.value;
    vendor.paymentTerms = PAYMENT_TERMS.find((k) => k.id == vendor.paymentTerms);

    return vendor;
  }) as any;

  return vendors;
};

// Get vendor by id
export const getVendorById = async (id: number) => {
  let vendor: any = await vendorRepository.findVendorById(id);

  vendor = vendor.get({ plain: true })

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  // get payment terms constant data.
  vendor.paymentTerms = PAYMENT_TERMS.find((e) => e.id == vendor.paymentTerms);

  vendor.ledgerAccount.subHeader = COA_SUB_HEADERS.find((k) => k.id == vendor.ledgerAccount.subHeaderId);
  vendor.ledgerAccount.header = COA_HEADERS.find((k) => k.id == vendor.ledgerAccount.subHeader.parent_id);
  vendor.ledgerAccount.ledgerType = COA_TYPES.find((k) => k.id == vendor.ledgerAccount.header.parent_id);

  return vendor;
};

// vendors according to SIPL.
export const vendorAccordingToSIPL = async (id: number) => {
  return await vendorRepository.findVendorAccordingToSIPL(id);
};

// Vendor for master.
export const getVendorsForMaster = async (clientId: number) => {
  return await vendorRepository.getVendorsForMaster(clientId);
};

// get all bills with pagination and filters
export const getAllBillsForVendor = async (vendorId: number) => {
  const bills = await billService.billForVendor(vendorId);

  const sipls = await siplService.getSIPLByVendor(vendorId);

  const returnBillData = await Promise.all(
    bills.map(async (bill: any) => {
      const paidAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
        bill.id,
        PAYMENT_BILL_REFERENCE_TYPES.BILL
      );

      return {
        id: bill.id,
        type: "bill",
        subtype: bill.type,
        sipl:
          bill.referenceType == BILL_REFERENCE_TYPES.SIPL
            ? bill.sipl.purchaseOrder.clientPoNumber + "-" + bill.sipl.poSiplNumber
            : null,
        invoice: bill.invoice,
        invoiceDate: bill.invoiceDate,
        dueDate: bill.dueDate,
        invoiceAmount: bill.total,
        transaction: bill.clientBillNumber,
        paidAmount,
      };
    })
  );

  const returnSIPLData = await Promise.all(
    sipls.map(async (sipl: any) => {
      const paidAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
        sipl.id,
        PAYMENT_BILL_REFERENCE_TYPES.SIPL
      );

      return {
        id: sipl.id,
        type: "sipl",
        subtype: "",
        sipl: sipl.purchaseOrder.clientPoNumber + "-" + sipl.poSiplNumber,
        invoice: sipl.supplierInvoiceNumber,
        invoiceDate: sipl.supplierInvoiceDate,
        dueDate: sipl.dueDate,
        invoiceAmount: sipl.totalAmount,
        transaction: sipl.clientInvoiceNumber,
        paidAmount,
      };
    })
  );

  const finalArr = returnBillData.concat(returnSIPLData);

  const finalData = {
    total: _.sumBy(finalArr, "invoiceAmount"),
    totalPaid: _.sumBy(finalArr, "paidAmount"),
    data: finalArr,
  };

  return finalData;
};

/**
 * Validates referenced IDs and primaryPhoneNo uniqueness in CSV data.
 */
const validateBulkVendorIds = async (csvRows: any[], clientId: number) => {
  const phoneToRowNumbers = new Map<string, number[]>();
  const paymentTermIds = new Set<number>();
  const paymentTermIdToRows = new Map<number, number[]>();

  csvRows.forEach((row) => {
    const rowNum = row._rowNumber;
    const phone = (row.primaryPhoneNo || row.PrimaryPhoneNo || "").trim();
    if (phone) {
      const rows = phoneToRowNumbers.get(phone) || [];
      rows.push(rowNum);
      phoneToRowNumbers.set(phone, rows);
    }
    if (row.paymentTerms) {
      const id = Number(row.paymentTerms);
      const rows = paymentTermIdToRows.get(id) || [];
      rows.push(rowNum);
      paymentTermIdToRows.set(id, rows);
      paymentTermIds.add(id);
    }
  });

  const errors: string[] = [];

  // Duplicate primaryPhoneNo in CSV
  phoneToRowNumbers.forEach((rows, phone) => {
    if (rows.length > 1) {
      errors.push(`Row ${rows.join(", ")}: Duplicate primaryPhoneNo found in CSV: "${phone}"`);
    }
  });

  // primaryPhoneNo already exists in database
  const allPhones = Array.from(phoneToRowNumbers.keys());
  const existingVendors = await vendorRepository.findVendorsByPrimaryPhoneNumbers(clientId, allPhones);
  existingVendors.forEach((v: any) => {
    const rows = phoneToRowNumbers.get(v.primaryPhoneNo) || [];
    errors.push(`Row ${rows.join(", ")}: primaryPhoneNo already exists in database: "${v.primaryPhoneNo}"`);
  });

  // Validate paymentTerms
  const validPaymentTermIds = new Set(PAYMENT_TERMS.map((p) => p.id));
  paymentTermIds.forEach((id) => {
    if (!validPaymentTermIds.has(id)) {
      const rows = paymentTermIdToRows.get(id) || [];
      errors.push(`Row ${rows.join(", ")}: Invalid paymentTerms ID: ${id}`);
    }
  });

  if (errors.length > 0) {
    throw new AppError(`Bulk validation failed:\n${errors.join("\n")}`, 400);
  }
};

/**
 * Parses and validates CSV rows for bulk vendor upload.
 */
const prepareBulkVendorData = (csvRows: any[], userId: number) => {
  const vendors: any[] = [];
  const errors: string[] = [];

  csvRows.forEach((data) => {
    const rowNum = data._rowNumber;

    const inputData = {
      name: (data.name || data.Name || "").trim(),
      printName: (data.printName || data.PrintName || data.name || data.Name || "").trim(),
      email: (data.email || data.Email || "").trim(),
      primaryPhoneNo: (data.primaryPhoneNo || data.PrimaryPhoneNo || "").trim(),
      type: (data.type || data.Type || "").trim().toUpperCase() || null,
      contactName: data.contactName || data.ContactName || null,
      secondaryPhoneNo: data.secondaryPhoneNo || data.SecondaryPhoneNo || null,
      landlineNo: data.landlineNo || data.LandlineNo || null,
      accountingEmail: data.accountingEmail || data.AccountingEmail || null,
      vendorScope: data.vendorScope || data.VendorScope || null,
      paymentTerms: data.paymentTerms ? Number(data.paymentTerms) : null,
      status: (data.status || "active") as "active" | "inactive",
      currency: data.currency || "USD",
      remitAddress: data.remitAddress || data.RemitAddress || null,
      remitSuite: data.remitSuite || data.RemitSuite || null,
      remitCity: data.remitCity || data.RemitCity || null,
      remitState: data.remitState || data.RemitState || null,
      remitZip: data.remitZip || data.RemitZip || null,
      remitCountry: data.remitCountry || data.RemitCountry || null,
      shippingAddress: data.shippingAddress || data.ShippingAddress || null,
      shippingSuite: data.shippingSuite || data.ShippingSuite || null,
      shippingCity: data.shippingCity || data.ShippingCity || null,
      shippingState: data.shippingState || data.ShippingState || null,
      shippingZip: data.shippingZip || data.ShippingZip || null,
      shippingCountry: data.shippingCountry || data.ShippingCountry || null,
    };

    const validation = vendorBulkUploadSchema.safeParse(inputData);

    if (!validation.success) {
      const rowErrors = validation.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      errors.push(`Row ${rowNum}: ${rowErrors}`);
    } else {
      vendors.push({ ...validation.data, _rowNumber: rowNum });
    }
  });

  if (errors.length > 0) {
    throw new AppError(`Validation failed for some rows: \n${errors.join("\n")}`, 400);
  }

  return vendors;
};

/**
 * Bulk upload vendors via CSV.
 */
export const bulkUploadVendors = async (fileBuffer: Buffer, userId: number, clientId: number) => {
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
    throw new AppError("No vendors found in the CSV file.", 400);
  }

  // 2. Validate referenced IDs and primaryPhoneNo uniqueness
  await validateBulkVendorIds(csvRows, clientId);

  // 3. Prepare and validate row data
  const vendorsData = prepareBulkVendorData(csvRows, userId);

  // 4. Prepare vendors (remove _rowNumber)
  const vendorsToCreate = vendorsData.map(({ _rowNumber, ...vendor }) => ({
    ...vendor,
    createdBy: userId,
    clientId,
  }));

  // 5. Bulk create within transaction (no scoped - clientId in each row)
  const result = await sequelize.transaction(async (transaction) => {
    const createdVendors: any[] = await vendorRepository.bulkCreateVendorsForBulkUpload(vendorsToCreate, transaction);

    const subHeaderId = COA_SUB_HEADERS.find((e) => e.key == "trade_payables")?.id;
    if (!subHeaderId) {
      throw new AppError("Ledger account sub-header not found.", 500);
    }

    const ledgerAccountsToCreate = createdVendors.map((vendor: any) => ({
      name: vendor.name,
      subHeaderId,
      clientId,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR,
      referenceId: vendor.id,
    }));

    await ledgerAccountRepository.bulkCreateLedgerAccountsForBulkUpload(ledgerAccountsToCreate, transaction);

    return { createdVendorsCount: createdVendors.length };
  });

  return result;
};

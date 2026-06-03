import { AppError } from "../helper/appError";
import csv from "csv-parser";
import * as models from "../models";
import { Readable } from "stream";
import * as XLSX from "xlsx";
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
import * as vendorContactRepository from "../repositories/vendorContact.repository";

// Service function to create a vendor.
export const registerVendor = async (vendorData: any, clientId: number) => {
  const transaction = await sequelize.transaction();
  try {
    if (!vendorData.name) {
      throw new Error("Name is a required field.");
    }

    // Create vendor
    const newVendor: any = await vendorRepository.createVendor({ ...vendorData, clientId }, transaction);

    // Create primary contact in vendor_contacts table
    await vendorContactRepository.createVendorContact({
      vendorId: newVendor.id,
      phone: vendorData.primaryPhoneNo,
      email: vendorData.email,
      isPrimary: true,
      clientId
    }, transaction);

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

    await transaction.commit();
    return { vendor: newVendor, ledgerAccount };
  } catch (error) {
    await transaction.rollback();
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

const ALLOWED_VENDOR_HEADERS = [
  "name", "Name",
  "printName", "PrintName",
  "email", "Email",
  "primaryPhoneNo", "PrimaryPhoneNo",
  "type", "Type",
  "contactName", "ContactName",
  "secondaryPhoneNo", "SecondaryPhoneNo",
  "landlineNo", "LandlineNo",
  "accountingEmail", "AccountingEmail",
  "vendorScope", "VendorScope",
  "paymentTerms", "PaymentTerms", "Payment Terms", "payment_terms",
  "status", "Status",
  "currency", "Currency",
  "remitAddress", "RemitAddress",
  "remitSuite", "RemitSuite",
  "remitCity", "RemitCity",
  "remitState", "RemitState",
  "remitZip", "RemitZip",
  "remitCountry", "RemitCountry",
  "shippingAddress", "ShippingAddress",
  "shippingSuite", "ShippingSuite",
  "shippingCity", "ShippingCity",
  "shippingState", "ShippingState",
  "shippingZip", "ShippingZip",
  "shippingCountry", "ShippingCountry",
  "internalNotes", "InternalNotes", "Internal Notes", "internal_notes",
];

const REQUIRED_VENDOR_HEADERS = [
  "name",
  "type",
];

/**
 * Maps payment terms string or number to valid paymentTerms constants ID.
 */
const parsePaymentTerms = (term: any): number | null => {
  if (term === null || term === undefined) return null;
  const termStr = String(term).trim().toLowerCase();
  if (!termStr) return null;

  // 1. Check if it matches ID directly (1 to 6)
  const idNum = Number(termStr);
  if (!isNaN(idNum) && Number.isInteger(idNum) && idNum >= 1 && idNum <= 6) {
    return idNum;
  }

  // 2. Handle COD
  if (termStr === "cod") {
    return 6;
  }

  // 3. Extract number from string, e.g. "30 days" -> "30", "120 DAYS" -> "120"
  const matchDigits = termStr.match(/^(\d+)\s*(days?|day)?$/);
  if (matchDigits) {
    const days = matchDigits[1];
    const found = PAYMENT_TERMS.find((p) => p.value === days);
    if (found) {
      return found.id;
    }
  }

  // Fallback: search for just the digits anywhere or the exact value in PAYMENT_TERMS
  const onlyDigits = termStr.replace(/\D/g, "");
  if (onlyDigits) {
    const found = PAYMENT_TERMS.find((p) => p.value === onlyDigits);
    if (found) {
      return found.id;
    }
  }

  const foundByValue = PAYMENT_TERMS.find(
    (p) => p.value.toLowerCase() === termStr
  );
  if (foundByValue) {
    return foundByValue.id;
  }

  return null;
};

/**
 * Maps vendor scope string or numeric ID to scope ID.
 */
const parseVendorScope = (scope: any): string | null => {
  if (scope === null || scope === undefined) return null;
  const scopeStr = String(scope).trim().toLowerCase();
  if (!scopeStr) return null;

  if (scopeStr === "1" || scopeStr === "national") {
    return "1";
  }
  if (scopeStr === "2" || scopeStr === "international") {
    return "2";
  }
  return scopeStr;
};

/**
 * Normalizes CSV rows to match vendor model structure and clean raw values.
 */
const normalizeVendorRows = (csvRows: any[]) => {
  return csvRows.map((data) => {
    const rawTerms = data.paymentTerms || data.PaymentTerms || data["Payment Terms"] || data.payment_terms;
    let paymentTerms: number | null = null;
    if (rawTerms !== undefined && rawTerms !== null && String(rawTerms).trim() !== "") {
      const parsed = parsePaymentTerms(rawTerms);
      paymentTerms = parsed !== null ? parsed : NaN;
    }

    const rawScope = data.vendorScope || data.VendorScope || null;
    const vendorScope = rawScope ? parseVendorScope(rawScope) : null;

    return {
      _rowNumber: data._rowNumber,
      name: (data.name || data.Name || "").trim(),
      printName: (data.printName || data.PrintName || data.name || data.Name || "").trim() || null,
      email: data.email || data.Email ? String(data.email || data.Email).trim() : null,
      primaryPhoneNo: data.primaryPhoneNo || data.PrimaryPhoneNo ? String(data.primaryPhoneNo || data.PrimaryPhoneNo).trim() : null,
      type: (data.type || data.Type || "").trim().toUpperCase() || null,
      contactName: data.contactName || data.ContactName || null,
      secondaryPhoneNo: data.secondaryPhoneNo || data.SecondaryPhoneNo || null,
      landlineNo: data.landlineNo || data.LandlineNo || null,
      accountingEmail: data.accountingEmail || data.AccountingEmail || null,
      vendorScope,
      paymentTerms,
      internalNotes: data.internalNotes || data.InternalNotes || data["Internal Notes"] || data.internal_notes || null,
      status: (data.status || data.Status || "active").toString().toLowerCase() as "active" | "inactive",
      currency: data.currency || data.Currency || "USD",
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
  });
};

/**
 * Stage 3: Cross-Row Column & Database validation.
 */
const validateVendorColumns = async (
  preparedRows: any[],
  clientId: number,
  errors: string[]
) => {
  const nameToRowNumbers = new Map<string, number[]>();
  const phoneToRowNumbers = new Map<string, number[]>();
  const emailToRowNumbers = new Map<string, number[]>();
  const paymentTermIdToRows = new Map<number, number[]>();
  const paymentTermIds = new Set<number>();
  const vendorScopeToRows = new Map<string, number[]>();
  const vendorScopes = new Set<string>();

  preparedRows.forEach((row) => {
    const rowNum = row._rowNumber;

    const name = (row.name || "").trim().toLowerCase();
    if (name) {
      const rows = nameToRowNumbers.get(name) || [];
      rows.push(rowNum);
      nameToRowNumbers.set(name, rows);
    }

    const phone = (row.primaryPhoneNo || "").trim();
    if (phone) {
      const rows = phoneToRowNumbers.get(phone) || [];
      rows.push(rowNum);
      phoneToRowNumbers.set(phone, rows);
    }

    const email = (row.email || "").trim().toLowerCase();
    if (email) {
      const rows = emailToRowNumbers.get(email) || [];
      rows.push(rowNum);
      emailToRowNumbers.set(email, rows);
    }

    if (row.paymentTerms !== null && row.paymentTerms !== undefined) {
      const id = row.paymentTerms;
      const rows = paymentTermIdToRows.get(id) || [];
      rows.push(rowNum);
      paymentTermIdToRows.set(id, rows);
      paymentTermIds.add(id);
    }

    if (row.vendorScope) {
      const scope = row.vendorScope;
      const rows = vendorScopeToRows.get(scope) || [];
      rows.push(rowNum);
      vendorScopeToRows.set(scope, rows);
      vendorScopes.add(scope);
    }
  });

  // 1. Duplicate checks within CSV
  nameToRowNumbers.forEach((rows, name) => {
    if (rows.length > 1) {
      errors.push(`Row ${rows.join(", ")}: Duplicate vendor name found in CSV: "${name}"`);
    }
  });

  phoneToRowNumbers.forEach((rows, phone) => {
    if (rows.length > 1) {
      errors.push(`Row ${rows.join(", ")}: Duplicate primaryPhoneNo found in CSV: "${phone}"`);
    }
  });

  emailToRowNumbers.forEach((rows, email) => {
    if (rows.length > 1) {
      errors.push(`Row ${rows.join(", ")}: Duplicate email found in CSV: "${email}"`);
    }
  });

  // 2. Database existence checks
  const allNames = Array.from(nameToRowNumbers.keys());
  if (allNames.length > 0) {
    const existingVendorsByName = await models.Vendor.findAll({
      where: { clientId, name: allNames },
      attributes: ["name"],
    });
    existingVendorsByName.forEach((v: any) => {
      const rows = nameToRowNumbers.get(v.name.toLowerCase()) || [];
      errors.push(`Row ${rows.join(", ")}: Vendor name already exists in database: "${v.name}"`);
    });
  }

  const allPhones = Array.from(phoneToRowNumbers.keys());
  if (allPhones.length > 0) {
    const existingVendorsByPhone = await vendorRepository.findVendorsByPrimaryPhoneNumbers(clientId, allPhones);
    existingVendorsByPhone.forEach((v: any) => {
      const rows = phoneToRowNumbers.get(v.primaryPhoneNo) || [];
      errors.push(`Row ${rows.join(", ")}: primaryPhoneNo already exists in database: "${v.primaryPhoneNo}"`);
    });
  }

  // 3. Enums validations (paymentTerms & vendorScope)
  const validPaymentTermIds = new Set(PAYMENT_TERMS.map((p) => p.id));
  paymentTermIds.forEach((id) => {
    if (isNaN(id) || !validPaymentTermIds.has(id)) {
      const rows = paymentTermIdToRows.get(id) || [];
      errors.push(`Row ${rows.join(", ")}: Invalid paymentTerms: ${id}`);
    }
  });

  const validScopes = new Set(SCOP.map((s) => String(s.id)));
  vendorScopes.forEach((scope) => {
    if (!validScopes.has(scope)) {
      const rows = vendorScopeToRows.get(scope) || [];
      errors.push(`Row ${rows.join(", ")}: Invalid vendorScope: "${scope}". Expected "National" or "International".`);
    }
  });
};

/**
 * Stage 4: Row-wise schema validation using Zod.
 */
const validateRowsSchema = (preparedRows: any[], errors: string[]) => {
  const validatedData: any[] = [];
  preparedRows.forEach((row) => {
    const { _rowNumber, ...rest } = row;
    const validation = vendorBulkUploadSchema.safeParse(rest);
    if (!validation.success) {
      const rowErrors = validation.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      errors.push(`Row ${_rowNumber}: ${rowErrors}`);
    } else {
      validatedData.push({ ...validation.data, _rowNumber });
    }
  });
  return validatedData;
};

/**
 * Bulk upload vendors via CSV.
 */
export const bulkUploadVendors = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  const csvRows: any[] = [];
  let rowNumber = 1;
  let headers: string[] = [];

  // 1. Parse File (CSV or Excel)
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get headers
    headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    if (headers) {
      const unrecognized = headers.filter((h: string) => h && !ALLOWED_VENDOR_HEADERS.includes(h));
      if (unrecognized.length > 0) {
        throw new AppError(`Unrecognized column(s): ${unrecognized.join(", ")}`, 400);
      }

      const missing = REQUIRED_VENDOR_HEADERS.filter((rh) => {
        const cap = rh.charAt(0).toUpperCase() + rh.slice(1);
        return !headers.includes(rh) && !headers.includes(cap);
      });
      if (missing.length > 0) {
        throw new AppError(`Missing required column(s): ${missing.join(", ")}`, 400);
      }
    }

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    csvRows.push(...data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber })));
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to parse file: ${error.message}`, 400);
  }

  // 2. Normalize raw CSV rows
  const preparedRows = normalizeVendorRows(csvRows);

  // 3. Cross-row column and database validation
  const errors: string[] = [];
  await validateVendorColumns(preparedRows, clientId, errors);

  if (errors.length > 0) {
    throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
  }

  // 4. Validate rows schema with Zod
  const vendorsData = validateRowsSchema(preparedRows, errors);

  if (errors.length > 0) {
    throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
  }

  // 5. Prepare vendors (remove _rowNumber)
  const vendorsToCreate = vendorsData.map(({ _rowNumber, ...vendor }) => ({
    ...vendor,
    createdBy: userId,
    clientId,
  }));

  // 6. Bulk create within transaction
  const result = await sequelize.transaction(async (transaction) => {
    // Create Note records first and assign internalNotesId to each vendor data object
    for (const vendor of vendorsToCreate as any[]) {
      if (vendor.internalNotes && String(vendor.internalNotes).trim()) {
        const note = await models.Notes.create({
          description: String(vendor.internalNotes).trim(),
          type: "internal",
          referenceType: "purchase_order",
          referenceId: 0,
          clientId,
        }, { transaction });
        vendor.internalNotesId = (note as any).id;
      }
      // Remove internalNotes since it is not a direct column on the Vendor model
      delete vendor.internalNotes;
    }

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


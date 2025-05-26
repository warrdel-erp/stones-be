import { AppError } from "../helper/appError";
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
    const newVendor: any = await vendorRepository.createVendor(vendorData, transaction);

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

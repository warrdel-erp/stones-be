import { AppError } from "../helper/appError";
import * as vendorRepository from "../repositories/vendor.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { type LedgerAccount } from "../models/ledgerAccount.model";
import { LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import { WhereOptions } from "sequelize";

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
      subHeaderId: 1002,
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
      referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR,
      referenceId: newVendor.id,
    };

    // console.log(vendorData.a.b.c);
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
  return await vendorRepository.getAllVendors(page, limit, filter);
};

// Get vendor by id
export const getVendorById = async (id: number) => {
  const vendor = await vendorRepository.findVendorById(id);

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return vendor;
};

import { AppError } from "../helper/appError";
import * as vendorRepository from "../repositories/vendor.repository";

/**
 * Service function to create a vendor.
 */
export const registerVendor = async (vendorData: any) => {
  if (!vendorData.name || !vendorData.code || !vendorData.email) {
    throw new Error("Name, Code, and Email are required fields.");
  }

  // Create vendor
  const newVendor = await vendorRepository.createVendor(vendorData);
  return newVendor;
};

// Update vendor
export const updateVendor = async (id: number, data: any) => {
  const updatedVendor = await vendorRepository.updateVendorById(id, data);
  if (!updatedVendor) throw new AppError("Vendor not found or update failed", 400);

  return updatedVendor;
};

// Get all vendors with pagination.
export const fetchAllVendors = async (page: number, limit: number, search?: string) => {
  return await vendorRepository.getAllVendors(page, limit, search);
};

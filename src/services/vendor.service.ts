import { createVendor } from "../repositories/vendor.repository";

/**
 * Service function to create a vendor.
 */
export const registerVendor = async (vendorData: any) => {
  if (!vendorData.name || !vendorData.code || !vendorData.email) {
    throw new Error("Name, Code, and Email are required fields.");
  }

  // Create vendor
  const newVendor = await createVendor(vendorData);
  return newVendor;
};

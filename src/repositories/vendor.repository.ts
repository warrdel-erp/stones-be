import Vendor from "../models/vendor";

/**
 * Create a new vendor in the database.
 */
export const createVendor = async (vendorData: any) => {
  return await Vendor.create(vendorData);
};

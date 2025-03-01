import { Op } from "sequelize";
import Vendor from "../models/vendor";

/**
 * Create a new vendor in the database.
 */
export const createVendor = async (vendorData: any) => {
  return await Vendor.create(vendorData);
};

// Update Vendor
export const updateVendorById = async (id: number, data: any) => {
  const [updatedCount, updatedVendors] = await Vendor.update(data, {
    where: { id },
    returning: true, // This returns the updated row in PostgreSQL but not in MySQL
  });

  if (updatedCount === 0) return null;

  // If using MySQL, manually fetch updated data
  const updatedVendor = await Vendor.findByPk(id);
  return updatedVendor;
};

// Get all vendors.
export const getAllVendors = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;

  const { rows: vendors, count: total } = await Vendor.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Sort by latest vendors
  });

  return { vendors, total, page, limit };
};

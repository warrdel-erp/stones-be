import { Op, Transaction, WhereOptions } from "sequelize";
import Vendor from "../models/vendor";

// Create a new vendor in the database.
export const createVendor = async (vendorData: any, transaction?: Transaction) => {
  return await Vendor.create(vendorData, { transaction });
};

// Update Vendor
export const updateVendorById = async (id: number, data: any) => {
  const [updatedCount] = await Vendor.update(data, {
    where: { id },
  });

  if (updatedCount === 0) return null;

  // If using MySQL, manually fetch updated data
  const updatedVendor = await Vendor.findByPk(id);
  return updatedVendor;
};

// Get all vendors.
export const getAllVendors = async (page: number, limit: number, filter?: WhereOptions) => {
  const offset = (page - 1) * limit;

  const { rows: vendors, count: total } = await Vendor.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Sort by latest vendors
  });

  return { vendors, total, page, limit };
};

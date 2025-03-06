import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";

// Create a new vendor in the database.
export const createVendor = async (vendorData: any, transaction?: Transaction) => {
  return await models.Vendor.create(vendorData, { transaction });
};

// Update Vendor
export const updateVendorById = async (id: number, data: any) => {
  const [updatedCount] = await models.Vendor.update(data, {
    where: { id },
  });

  if (updatedCount === 0) return null;

  // If using MySQL, manually fetch updated data
  const updatedVendor = await models.Vendor.findByPk(id);
  return updatedVendor;
};

// Get all vendors.
export const getAllVendors = async (page: number, limit: number, filter?: WhereOptions) => {
  const offset = (page - 1) * limit;

  const { rows: vendors, count: total } = await models.Vendor.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Sort by latest vendors
  });

  return { vendors, total, page, limit };
};

// Find vendor by ID
export const findVendorById = async (id: number) => {
  return await models.Vendor.findOne({
    where: { id },
    include: [
      {
        model: models.Location,
        as: "location",
      },
      {
        model: models.Notes,
        as: "notes",
      },
    ],
  });
};

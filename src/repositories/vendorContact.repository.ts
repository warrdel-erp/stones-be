import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Create a new vendor contact
 */
export const createVendorContact = async (data: any, transaction?: Transaction) => {
  return await scoped(models.VendorContact).create(data, { transaction });
};

/**
 * Bulk create vendor contacts
 */
export const bulkCreateVendorContacts = async (data: any[], transaction?: Transaction) => {
  return await scoped(models.VendorContact).bulkCreate(data, { transaction });
};

/**
 * Update vendor contact by ID
 */
export const updateVendorContact = async (id: number, data: any, transaction?: Transaction) => {
  return await scoped(models.VendorContact).update(data, {
    where: { id },
    transaction,
  });
};

/**
 * Delete vendor contact by ID
 */
export const deleteVendorContact = async (id: number, transaction?: Transaction) => {
  return await scoped(models.VendorContact).destroy({
    where: { id },
    transaction,
  });
};

/**
 * Get all vendor contacts with pagination and filters
 */
export const getAllVendorContacts = async (page: number, limit: number, filter?: WhereOptions) => {
  const offset = (page - 1) * limit;

  const { rows: data, count: total } = await scoped(models.VendorContact).findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [["isPrimary", "DESC"], ["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

/**
 * Find vendor contact by ID
 */
export const findVendorContactById = async (id: number) => {
  return await scoped(models.VendorContact).findOne({
    where: { id },
  });
};

/**
 * Find all contacts for a specific vendor
 */
export const findContactsByVendorId = async (vendorId: number) => {
  return await scoped(models.VendorContact).findAll({
    where: { vendorId },
    order: [["isPrimary", "DESC"], ["createdAt", "DESC"]],
  });
};

/**
 * Set all contacts of a vendor as non-primary
 */
export const resetPrimaryContacts = async (vendorId: number, transaction?: Transaction) => {
  return await scoped(models.VendorContact).update(
    { isPrimary: false },
    {
      where: { vendorId },
      transaction,
    }
  );
};

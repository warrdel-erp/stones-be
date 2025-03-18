import { Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { run } from "node:test";

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

export const findVendorAccordingToSIPL = async (id: number) => {
  return await models.Vendor.findAll({
    where: {
      [Op.or]: [
        { "$purchaseOrder.sipls.id$": id }, // Alias-based filtering
        { "$bills.referenceId$": id },
      ],
    },
    attributes: ["id", "name", "type"],
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        attributes: ["id"],
        include: [
          {
            model: models.SIPL,
            as: "sipls",
            required: true,
            attributes: ["id"],
            where: { id },
          },
        ],
      },
      {
        model: models.Bill,
        as: "bills",
        attributes: ["id", "referenceId"],
        required: false,
        where: {
          referenceType: BILL_REFERENCE_TYPES.SIPL,
          referenceId: id,
        },
      },
    ],
  });
};

import { Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

// Create a new vendor in the database.
export const createVendor = async (vendorData: any, transaction?: Transaction) => {
  return await scoped(models.Vendor).create(vendorData, { transaction });
};

// Update Vendor
export const updateVendorById = async (id: number, data: any) => {
  const [updatedCount] = await scoped(models.Vendor).update(data, {
    where: { id },
  });

  if (updatedCount === 0) return null;

  // If using MySQL, manually fetch updated data
  const updatedVendor = await models.Vendor.findByPk(id);
  return updatedVendor;
};

// Get all vendors.
export const getAllVendors = async (page: number, limit: number, filter?: any) => {
  const offset = (page - 1) * limit;
  const { search, ...whereClause } = filter || {};

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { printName: { [Op.like]: `%${search}%` } },
      { primaryPhoneNo: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows: vendors, count: total } = await scoped(models.Vendor).findAndCountAll({
    where: whereClause,
    include: [
      {
        model: models.Location,
        as: "parentLocation"
      },
      {
        association: "contacts"
      }
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]], // Sort by latest vendors
  });

  return { vendors, total, page, limit };
};

// Find vendor by ID
export const findVendorById = async (id: number) => {
  return await scoped(models.Vendor).findOne({
    where: { id },
    include: [
      {
        model: models.Location,
        as: "parentLocation",
      },
      {
        model: models.Notes,
        as: "notes",
      },
      {
        association: "ledgerAccount"
      },
      {
        association: "contacts"
      }
    ],
  });
};

export const findVendorAccordingToSIPL = async (id: number) => {
  return await scoped(models.Vendor).findAll({
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

export const getVendorsForMaster = async (clientId: number) => {
  return await scoped(models.Vendor).findAll({
    attributes: ["id", "name"], // Fetch only id and name
    where: { status: "active" }, // Fetch only active vendors
    include: [
      {
        model: models.User,
        as: "user",
        attributes: [],
        where: { clientId },
      },
    ],
  });
};

// Find existing vendors by primary phone numbers (for bulk upload validation)
// Uses models directly with explicit clientId - no scoped (avoids AsyncLocalStorage)
export const findVendorsByPrimaryPhoneNumbers = async (clientId: number, phoneNumbers: string[]) => {
  const uniquePhones = [...new Set(phoneNumbers)].filter(Boolean);
  if (uniquePhones.length === 0) return [];
  return models.Vendor.findAll({
    where: { clientId, primaryPhoneNo: uniquePhones },
    attributes: ["primaryPhoneNo"],
  });
};

// Bulk create vendors for bulk upload - uses models directly with explicit clientId in data (no scoped)
export const bulkCreateVendorsForBulkUpload = async (vendorsData: any[], transaction?: Transaction) => {
  return models.Vendor.bulkCreate(vendorsData, { transaction, validate: true });
};

// Get vendor options for dropdowns/selects
export const getVendorOptions = async (clientId: number, status?: string, type?: string) => {
  return scoped(models.Vendor).findAll({
    attributes: [
      ["name", "label"],
      ["id", "value"],
    ],
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    },
    include: [
      {
        model: models.User,
        as: "user",
        attributes: [],
        where: { clientId },
        required: true,
      },
    ],
    order: [["name", "ASC"]],
  });
};

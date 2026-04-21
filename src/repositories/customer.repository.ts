import { Transaction } from "sequelize";
import * as models from "../models";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

// Create a new customer in the database.
export const createCustomer = async (customerData: any, transaction?: Transaction) => {
  return await scoped(models.Customer).create(customerData, { transaction });
};



// Update Customer
export const updateCustomerById = async (id: number, data: any) => {
  const [updatedCount] = await scoped(models.Customer).update(data, {
    where: { id },
  });

  if (updatedCount === 0) return null;

  // If using MySQL, manually fetch updated data
  const updatedCustomer = await models.Customer.findByPk(id);
  return updatedCustomer;
};

// Get all customers.
export const getAllCustomers = async (page: number, limit: number, clientId: number, search?: string, filter?: any) => {
  const offset = (page - 1) * limit;

  const { rows: customers, count: total } = await scoped(models.Customer).findAndCountAll({
    where: { ...filter, clientId },
    include: [
      {
        model: models.CustomerAddress,
        as: "addresses",
      },
      {
        model: models.User,
        as: "primarySalesPerson",
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Sort by latest customers
  });

  return { customers, total, page, limit };
};

// Get customer by Id.
export const getCustomerById = async (id: number) => {
  const data = await models.Customer.findByPk(id, {
    include: [
      {
        association: "addresses",
      },
      {
        association: "ledgerAccount",
        where: { referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER }

      }
    ],
  });

  return data?.get({ plain: true });
};

// Get customer by id simple.
export const getCustomerByIdSimple = async (id: number) => {
  const data = await models.Customer.findByPk(id);

  return data?.get({ plain: true });
};

// Get customer options for dropdowns/selects
export const getCustomerOptions = async (clientId: number, status?: string, filters: any = {}) => {
  return scoped(models.Customer).findAll({
    attributes: [
      ["name", "label"],
      ["id", "value"],
    ],
    where: {
      clientId,
      ...(status ? { status } : {}),
      ...filters
    },
    order: [["name", "ASC"]],
  });
};

// Get customer minimal data (less detailed)
export const getCustomerMinimal = async (id: number, clientId: number) => {
  const data = await scoped(models.Customer).findOne({
    where: { id, clientId },
  });

  return data?.get({ plain: true });
};

// Find existing customers by primary phone numbers (for bulk upload validation)
// Uses models directly with explicit clientId - no scoped (avoids AsyncLocalStorage)
export const findCustomersByPrimaryPhoneNumbers = async (clientId: number, phoneNumbers: string[]) => {
  const uniquePhones = [...new Set(phoneNumbers)].filter(Boolean);
  if (uniquePhones.length === 0) return [];
  return models.Customer.findAll({
    where: { clientId, primaryPhoneNumber: uniquePhones },
    attributes: ["primaryPhoneNumber"],
  });
};

// Bulk create customers for bulk upload - uses models directly with explicit clientId in data (no scoped)
export const bulkCreateCustomers = async (customersData: any[], transaction?: Transaction) => {
  return models.Customer.bulkCreate(customersData, { transaction, validate: true });
};

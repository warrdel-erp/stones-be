import { Transaction } from "sequelize";
import * as models from "../models";

// Create a new customer in the database.
export const createCustomer = async (customerData: any, transaction?: Transaction) => {
  return await models.Customer.create(customerData, { transaction });
};

// Update Customer
export const updateCustomerById = async (id: number, data: any) => {
  const [updatedCount] = await models.Customer.update(data, {
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

  const { rows: customers, count: total } = await models.Customer.findAndCountAll({
    where: { ...filter, clientId },
    include: [
      {
        model: models.CustomerAddress,
        as: "addresses",
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Sort by latest customers
  });

  return { customers, total, page, limit };
};

// Get all customers.
export const getCustomerById = async (id: number) => {
  const data = await models.Customer.findByPk(id, {
    include: [
      {
        model: models.CustomerAddress,
        as: "addresses",
      },
    ],
  });

  return data?.get({ plain: true });
};

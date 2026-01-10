import { Transaction } from "sequelize";
import * as models from "../models";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

export const createCustomerAddress = async (data: any, transaction?: Transaction) => {
  return await scoped(models.CustomerAddress).create(data, { transaction });
};

// Create multiple addresses
export const createBulkCustomerAddress = async (data: any, transaction?: Transaction) => {
  return await scoped(models.CustomerAddress).bulkCreate(data, { transaction });
};

export const getAddressesByCustomerId = async (
  customerId: number,
  addressType?: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES]
) => {
  const whereCondition: any = { customerId };

  if (addressType) {
    whereCondition.addressType = addressType; // Filter by addressType if provided
  }

  return await models.CustomerAddress.findAll({
    where: whereCondition,
  });
};

// Get customer address options for dropdowns/selects
export const getCustomerAddressOptions = async (
  customerId: number,
  addressType?: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES]
) => {
  const whereCondition: any = { customerId };

  if (addressType) {
    whereCondition.addressType = addressType;
  }

  return models.CustomerAddress.findAll({
    attributes: [
      ["address", "label"],
      ["id", "value"],
    ],
    where: whereCondition,
    order: [["address", "ASC"]],
  });
};

// Get customer address by id
export const getCustomerAddressById = async (id: number) => {
  return await models.CustomerAddress.findByPk(id, {
    include: [
      {
        association: "customer",
        attributes: ["id", "name", "clientId"],
      },
    ],
  });
};

import { Transaction } from "sequelize";
import * as models from "../models";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";

export const createCustomerAddress = async (data: any, transaction?: Transaction) => {
  return await models.CustomerAddress.create(data, { transaction });
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

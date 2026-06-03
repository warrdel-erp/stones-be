import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import * as customerAddressRepository from "../repositories/customerAddress.repository";

export const createCustomerAddress = async (data: any, transaction?: Transaction) => {
  const execute = async (t: Transaction) => {
    if (data.isPrimary) {
      await customerAddressRepository.clearPrimaryStatus(data.customerId, data.addressType, undefined, t);
    }
    return await customerAddressRepository.createCustomerAddress(data, t);
  };

  if (transaction) {
    return await execute(transaction);
  }
  return await sequelize.transaction(async (t) => {
    return await execute(t);
  });
};

export const createBulkCustomerAddress = async (data: any[], transaction?: Transaction) => {
  const customerAddress = await customerAddressRepository.createBulkCustomerAddress(data, transaction);
  return customerAddress;
};

export const getAddressesByCustomerId = async (
  customerId: number,
  addressType?: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES]
) => {
  return await customerAddressRepository.getAddressesByCustomerId(customerId, addressType);
};

export const getCustomerAddressById = async (id: number, clientId?: number) => {
  const address = await customerAddressRepository.getCustomerAddressById(id);

  if (!address) {
    throw new AppError("Customer address not found", 404);
  }

  // If clientId is provided, verify the address belongs to a customer of that client
  if (clientId) {
    const customer = address.get({ plain: true })?.customer;
    if (!customer || customer.clientId !== clientId) {
      throw new AppError("Customer address not found or access denied", 404);
    }
  }

  return address.get({ plain: true });
};

export const updateCustomerAddress = async (id: number, data: any, transaction?: Transaction) => {
  const address = await getCustomerAddressById(id);
  if (!address) {
    throw new AppError("Customer address not found", 404);
  }

  const execute = async (t: Transaction) => {
    const isSettingPrimary = data.isPrimary === true;
    const finalAddressType = data.addressType || address.addressType;
    const finalCustomerId = address.customerId;

    if (isSettingPrimary) {
      await customerAddressRepository.clearPrimaryStatus(finalCustomerId, finalAddressType, id, t);
    }

    return await customerAddressRepository.updateCustomerAddress(id, data, t);
  };

  if (transaction) {
    return await execute(transaction);
  }
  return await sequelize.transaction(async (t) => {
    return await execute(t);
  });
};

export const deleteCustomerAddress = async (id: number, transaction?: Transaction) => {
  const address = await getCustomerAddressById(id);
  if (!address) {
    throw new AppError("Customer address not found", 404);
  }
  return await customerAddressRepository.deleteCustomerAddress(id, transaction);
};

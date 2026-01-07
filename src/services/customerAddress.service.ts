import { Transaction } from "sequelize";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";
import { AppError } from "../helper/appError";
import * as customerAddressRepository from "../repositories/customerAddress.repository";

export const createCustomerAddress = async (data: any, transaction?: Transaction) => {
  const customerAddress = await customerAddressRepository.createCustomerAddress(data, transaction);
  return customerAddress;
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

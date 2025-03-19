import { Transaction } from "sequelize";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";
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

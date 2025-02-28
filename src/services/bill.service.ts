import * as billRepository from "../repositories/bill.repository";

export const createBill = async (billData: any) => {
  return await billRepository.createBill(billData);
};

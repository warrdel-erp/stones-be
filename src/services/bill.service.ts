import * as billRepository from "../repositories/bill.repository";

export const createBill = async (billData: any) => {
  return await billRepository.createBill(billData);
};

// get one bill by id
export const getOneBill = async (id: number) => {
  const bill = await billRepository.getOneBill(id);
  if (!bill) {
    throw new Error("Bill not found");
  }
  return bill;
};

// get all bills with pagination and filters
export const getAllBills = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const { count, rows } = await billRepository.getAllBills(page, limit, filters);
  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

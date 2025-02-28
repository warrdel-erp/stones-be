import Bill from "../models/bill";

export const createBill = async (billData: any) => {
  return await Bill.create(billData);
};

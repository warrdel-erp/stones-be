import * as models from "../models";

export const createBill = async (billData: any) => {
  return await models.Bill.create(billData);
};

export const getOneBill = async (id: number) => {
  return await models.Bill.findByPk(id);
};

export const getAllBills = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const offset = (page - 1) * limit;

  // Build where clause dynamically if filters are provided
  const whereClause = filters ? { ...filters } : {};

  return await models.Bill.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

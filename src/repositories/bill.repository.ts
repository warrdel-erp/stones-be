import { Transaction, where } from "sequelize";
import * as models from "../models";

export const createBill = async (billData: any, transaction?: Transaction) => {
  return await models.Bill.create(billData, { transaction });
};

export const getOneBill = async (id: number) => {
  return await models.Bill.findByPk(id, {
    include: [
      {
        model: models.BillItem,
        as: "billItems",
      },
    ],
  });
};

export const getAllBills = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const offset = (page - 1) * limit;

  // Build where clause dynamically if filters are provided
  const whereClause = filters ? { ...filters } : {};

  return await models.Bill.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: models.BillItem,
        as: "billItems",
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

export const getAllBillsForVendor = async (filters?: { [key: string]: any }) => {
  // Build where clause dynamically if filters are provided
  let whereClause = filters ? { ...filters } : {};

  return await models.Bill.findAll({
    where: whereClause,
    include: [
      {
        model: models.BillItem,
        as: "billItems",
      },
      {
        model: models.SIPL,
        as: "sipl",
        include: [
          {
            model: models.PurchaseOrder,
            as: "purchaseOrder",
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// Get latest Bill number
export const getBillNumber = async (clientId: number) => {
  let lastBill: any = await models.Bill.findOne({
    where: { clientId: clientId },
    order: [["clientBillNumber", "DESC"]],
  });

  return { clientBillNumber: lastBill ? lastBill?.clientBillNumber + 1 : 1 };
};

import { col, fn, Op, Transaction, where, WhereOptions } from "sequelize";
import * as models from "../models";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";

export const createBill = async (billData: any, transaction?: Transaction) => {
  return await models.Bill.create(billData, { transaction });
};

export const getBillByPk = async (id: number) => {
  return await models.Bill.findByPk(id, {
    include: [
      {
        model: models.BillItem,
        as: "billItems",
      },
    ],
  });
};

export const findOne = async (filter: WhereOptions) => {
  return await models.Bill.findOne({
    where: filter,
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

// does all given bills belong to the given vendor
export const areBillsBelongingToVendor = async (vendorId: number, billIds: number[]): Promise<boolean> => {
  const count = await models.Bill.count({
    where: {
      id: {
        [Op.in]: billIds, // Get only bills that match the given IDs
      },
      vendorId, // Ensure the vendorId matches
    },
  });

  return count === billIds.length; // If count matches the number of IDs, all belong to vendor
};

export const getTotalBillValueByClient = async (clientId: number) => {
  const result = await models.Bill.findOne({
    include: [
      {
        model: models.User,
        as: "creator",
        where: {
          clientId,
        },
        required: true,
      },
    ],
    attributes: [[fn("SUM", col("amount")), "totalValue"]],
    group: ["bills.id"]
  });

  return Number(result?.dataValues?.totalValue) ?? 0;
};

export const getLastBillAsPerSIPL = async (siplId: number) => {
  return await models.Bill.findOne({
    where: {
      referenceType: BILL_REFERENCE_TYPES.SIPL,
      referenceId: siplId,
    },
    order: [["siplBillNumber", "DESC"]],
  });
}
import CustomerTransaction from "../models/customerTransaction.model";
import { Transaction } from "sequelize";

export const bulkCreateExternalTransactions = async (data: any[], transaction?: Transaction) => {
  return await CustomerTransaction.bulkCreate(data, { transaction, validate: true });
};

export const findAllExternalTransactions = async (
  offset: number,
  limit: number,
  clientId: number,
  search?: string,
  filters?: any
) => {
  const { Op } = require("sequelize");
  const where: any = { clientId, ...filters };

  if (search) {
    where[Op.or] = [
      { customerCode: { [Op.like]: `%${search}%` } },
      { transactionNo: { [Op.like]: `%${search}%` } },
      { invoiceNo: { [Op.like]: `%${search}%` } },
      { jobName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await CustomerTransaction.findAndCountAll({
    where,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        association: "customer",
        attributes: ["id", "name", "customerCode"],
      },
    ],
  });

  return { transactions: rows, total: count };
};

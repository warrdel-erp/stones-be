import CustomerExternalAgedInvoice from "../models/customerExternalAgedInvoice.model";
import { Transaction } from "sequelize";

export const bulkCreateCustomerExternalAgedInvoices = async (data: any[], transaction?: Transaction) => {
  return await CustomerExternalAgedInvoice.bulkCreate(data, { transaction, validate: true });
};

export const findAllCustomerExternalAgedInvoices = async (
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

  const { rows, count } = await CustomerExternalAgedInvoice.findAndCountAll({
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

import CustomerExternalInvoice from "../models/customerExternalInvoice.model";
import { Transaction } from "sequelize";

export const bulkCreateCustomerExternalInvoices = async (data: any[], transaction?: Transaction) => {
  return await CustomerExternalInvoice.bulkCreate(data, { transaction, validate: true });
};

export const findAllCustomerExternalInvoices = async (
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
      { item: { [Op.like]: `%${search}%` } },
      { customer: { [Op.like]: `%${search}%` } },
      { transactionNo: { [Op.like]: `%${search}%` } },
      { invoiceNo: { [Op.like]: `%${search}%` } },
      { jobName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await CustomerExternalInvoice.findAndCountAll({
    where,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        association: "customerRef",
        attributes: ["id", "name", "customerCode"],
      },
      {
        association: "product",
        attributes: ["id", "name"],
      },
    ],
  });

  return { transactions: rows, total: count };
};

import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { SoInvoice } from "../models/salesOrderInvoice.model";
import { Op, fn, col } from "sequelize";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
  return await models.SalesOrderInvoice.create(data, { transaction });
};

/**
 * Fetch all invoices
 */
export const getAllInvoices = async (filter: WhereOptions, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findAll({
    where: filter,
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name"],
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
      },
    ],
    transaction,
  });
};

export const getTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {

  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const result: any = await models.SalesOrderInvoice.findOne({
    attributes: [[fn("SUM", col("amount")), "totalAmount"]],
    where: {
      clientId,
      createdAt: {
        [Op.between]: [from, to],
      },
    },
    raw: true,
  });

  return result?.totalAmount ?? 0;
};

export const getTotalAmountForClient = async (clientId: number) => {
  const result: any = await models.SalesOrderInvoice.findOne({
    attributes: [[fn("SUM", col("amount")), "totalAmount"]],
    where: {
      clientId,
    },
    raw: true,
  });

  return result?.totalAmount ?? 0;
};


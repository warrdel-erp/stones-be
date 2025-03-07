import { Transaction } from "sequelize";
import * as models from "../models";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await models.SalesOrder.create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    include: [
      { model: models.Customer, as: "customer" },
      { model: models.User, as: "createdBy" },
      { model: models.CustomerAddress, as: "shippingAddress" },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get One SO
export const getSalesOrderById = async (id: number) => {
  return await models.SalesOrder.findOne({
    where: { id },
    include: [
      { model: models.Customer, as: "customer" },
      { model: models.User, as: "createdBy" },
      { model: models.CustomerAddress, as: "shippingAddress" },
    ],
  });
};

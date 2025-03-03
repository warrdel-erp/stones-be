import { Transaction } from "sequelize";
import * as models from "../models";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await models.SalesOrder.create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async () => {
  return await models.SalesOrder.findAll({
    include: [
      { model: models.Customer, as: "customer" },
      { model: models.User, as: "createdBy" },
      { model: models.CustomerAddress, as: "shippingAddress" },
    ],
  });
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

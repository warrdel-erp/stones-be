import { Transaction } from "sequelize";
import { AppError } from "../helper/appError";
import * as models from "../models";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  return await models.LoadingOrder.create(data);
};

// Get all LO
export const getAllLoadingOrders = async () => {
  return await models.LoadingOrder.findAll({
    include: [{ model: models.SalesOrder, as: "salesOrder" }],
  });
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  return await models.LoadingOrder.findByPk(id, {
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.LoadingOrderProduct, as: "loadingOrderProducts" },
    ],
  });
};

// Get loading order by Id
export const getLoadingOrderByIdSimple = async (id: number) => {
  return await models.LoadingOrder.findByPk(id);
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await models.LoadingOrder.findAll({
    where: { salesOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.LoadingOrderProduct, as: "loadingOrderProducts" },
    ],
  });
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any, transaction?: Transaction) => {
  const loadingOrder = await models.LoadingOrder.update(data, { where: { id }, transaction, individualHooks: true });
  return loadingOrder;
};

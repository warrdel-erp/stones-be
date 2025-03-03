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
export const updateLoadingOrder = async (id: number, data: any) => {
  const loadingOrder = await models.LoadingOrder.findByPk(id);
  if (!loadingOrder) return null;

  await loadingOrder.update(data);
  return loadingOrder;
};

import * as loadingOrderRepo from "../repositories/loadingOrder.repository";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  return await loadingOrderRepo.createLoadingOrder(data);
};

// Get all LO
export const getAllLoadingOrders = async () => {
  return await loadingOrderRepo.getAllLoadingOrders();
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  return await loadingOrderRepo.getLoadingOrderById(id);
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await loadingOrderRepo.getLoadingOrdersBySalesOrderId(salesOrderId);
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any) => {
  return await loadingOrderRepo.updateLoadingOrder(id, data);
};

import { AppError } from "../helper/appError";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as loadingOrderProductService from "../services/loadingOrderProduct.service";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(data);
  loadingOrder = loadingOrder.get({ plain: true });

  if (data?.products) {
    await loadingOrderProductService.upsertLoadingOrderProducts(data.products, loadingOrder.id);
  }

  return loadingOrder;
};

// Get all LO
export const getAllLoadingOrders = async () => {
  return await loadingOrderRepository.getAllLoadingOrders();
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  return await loadingOrderRepository.getLoadingOrderById(id);
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await loadingOrderRepository.getLoadingOrdersBySalesOrderId(salesOrderId);
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any) => {
  return await loadingOrderRepository.updateLoadingOrder(id, data);
};

export const checkIfLoadingOrderInvoiced = async (loadingOrderId: number, operation: string) => {
  const loadingOrder = (await getLoadingOrderById(loadingOrderId))?.get({ plain: true });

  if (!loadingOrder) {
    throw new AppError("Loading Order not found", 404);
  }

  // Check if loading order is invoiced then can't create packaging list.
  if (loadingOrder.invoiced) {
    throw new AppError(`Cannot ${operation} for an invoiced Loading Order`, 400);
  }

  return loadingOrder;
};

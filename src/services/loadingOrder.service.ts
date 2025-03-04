import { AppError } from "../helper/appError";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as loadingOrderProductService from "../services/loadingOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as slabRepository from "../repositories/slab.repository";
import { SLAB_STATUS } from "../constants";
import { sequelize } from "../config/database";

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

// Invoice Loading Order
export const invoiceLoadingOrder = async (id: number, data: any) => {
  const transaction = await sequelize.transaction();

  try {
    let loadingOrder: any = await loadingOrderService.getLoadingOrderById(Number(id));

    if (!loadingOrder) {
      throw new AppError(`Loading order does not exists with given id: ${id}`, 400);
    }

    if (loadingOrder.invoiced) {
      throw new AppError("Cannot invoice Loading Order as it is already invoiced.", 400);
    }

    // If LO doesn't have any product.
    if (!loadingOrder?.loadingOrderProducts?.length) {
      throw new AppError("Loading order with id: ${id} does not have any product added. So it can't be invoiced", 400);
    }

    loadingOrder = loadingOrder.get({ plain: true });

    // Mark corresponding slabs as SOLD
    for (const loadingOrderProducts of loadingOrder?.loadingOrderProducts) {
      await slabRepository.updateSlabStatusByInventoryProduct(
        loadingOrderProducts.inventoryProductId,
        SLAB_STATUS.SOLD,
        transaction
      );
    }

    loadingOrder = await loadingOrderRepository.updateLoadingOrder(id, data, transaction);

    transaction.commit();
    return loadingOrder;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
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

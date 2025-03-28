import { AppError } from "../helper/appError";
import { SLAB_STATUS } from "../constants";
import { sequelize } from "../config/database";
import { WhereOptions } from "sequelize";
import _ from "lodash";

import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as loadingOrderProductService from "../services/loadingOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as slabRepository from "../repositories/slab.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import { LOADING_ORDER_STAGES } from "../constants/tableTypes";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(data);
  loadingOrder = loadingOrder.get({ plain: true });

  let createdProducts = [];

  if (data?.products) {
    const SOProductIds = data.products.map((e: any) => e.salesOrderProductId);
    const doesBelongToSO = await salesOrderProductRepository.areSOProductsBelongingToSO(
      SOProductIds,
      data.salesOrderId
    );

    if (!doesBelongToSO) {
      throw new AppError("All salesOrderProductIds does not belongs to given SO", 400);
    }

    createdProducts = await loadingOrderProductService.upsertLoadingOrderProducts(data.products, loadingOrder.id);
  }

  return { ...loadingOrder, products: createdProducts };
};

// Get all LO
export const getAllLoadingOrders = async (page: number, limit: number) => {
  return await loadingOrderRepository.getAllLoadingOrders(page, limit);
};

// Get all LO without pagination.
export const getAllLoadingOrdersWithoutPagination = async (filters: WhereOptions) => {
  let loadingOrders = await loadingOrderRepository.getAllLoadingOrdersWithoutPagination(filters);

  // get total amount of all LOs'
  loadingOrders = loadingOrderWithTotalAmount(loadingOrders);

  return loadingOrders;
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await loadingOrderRepository.getLoadingOrderById(id);

  // Calculate total amount added in SO.
  loadingOrder.totalAmount = loadingOrder.loadingOrderProducts.reduce(
    (total: number, loadingOrderProduct: any) =>
      total +
      (loadingOrderProduct.remeasureLength * loadingOrderProduct.remeasureWidth * loadingOrderProduct.unitPrice) / 144,
    0
  );

  return loadingOrder;
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
export const invoiceLoadingOrder = async (id: number) => {
  const transaction = await sequelize.transaction();

  try {
    let loadingOrder: any = await loadingOrderService.getLoadingOrderById(Number(id));

    if (!loadingOrder) {
      throw new AppError(`Loading order does not exists with given id: ${id}`, 400);
    }

    // Check if loading order is invoiced then can't invoice it again.
    if (loadingOrder.stage == LOADING_ORDER_STAGES.INVOICED) {
      throw new AppError("Cannot invoice Loading Order as it is already invoiced.", 400);
    }

    // If LO doesn't have any product.
    if (!loadingOrder?.loadingOrderProducts?.length) {
      throw new AppError("Loading order with id: ${id} does not have any product added. So it can't be invoiced", 400);
    }

    // If Packaging list exists then mark sold to packaging list products. otherwise mark sold to loading order products.
    let soldSlabProducts: any[] = [];
    if (loadingOrder.packagingList) {
      soldSlabProducts = loadingOrder.packagingList.packagingListProducts;
    } else {
      soldSlabProducts = loadingOrder.loadingOrderProducts;
    }

    // Mark corresponding slabs as SOLD
    for (const loadingOrderProducts of soldSlabProducts) {
      await slabRepository.updateSlabStatusByInventoryProduct(
        loadingOrderProducts.inventoryProductId,
        SLAB_STATUS.SOLD,
        transaction
      );
    }

    // if Packaging list exists then mark invoiced to packaging list.
    if (loadingOrder.packagingList) {
      await packagingListRepository.updatePackagingList(
        loadingOrder.packagingList?.id,
        { invoiced: true },
        transaction
      );
    }

    await loadingOrderRepository.updateLoadingOrder(id, { stage: LOADING_ORDER_STAGES.INVOICED }, transaction);

    transaction.commit();
    return loadingOrder;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

export const checkIfLoadingOrderInvoiced = async (loadingOrderId: number, operation: string) => {
  const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(loadingOrderId))?.get({ plain: true });

  if (!loadingOrder) {
    throw new AppError("Loading Order not found", 404);
  }

  // Check if loading order is invoiced then can't create packaging list.
  if (loadingOrder.stage == LOADING_ORDER_STAGES.INVOICED) {
    throw new AppError(`Cannot ${operation} for an invoiced Loading Order`, 400);
  }

  return loadingOrder;
};

// Get new LO number
export const getLONumber = async (clientId: number) => {
  return await loadingOrderRepository.getLoNumber(clientId);
};

function loadingOrderWithTotalAmount(loadingOrders: any) {
  return loadingOrders.map((loadingOrder: any) => {
    loadingOrder = loadingOrder.get({ plain: true });

    // Calculate total amount added in LO.
    loadingOrder.totalAmount = _.sumBy(
      loadingOrder.loadingOrderProducts,
      (loadingOrderProduct: any) =>
        (loadingOrderProduct.remeasureLength * loadingOrderProduct.remeasureWidth * loadingOrderProduct.unitPrice) / 144
    );

    return loadingOrder;
  });
}

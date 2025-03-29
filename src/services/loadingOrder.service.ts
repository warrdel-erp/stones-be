import { AppError } from "../helper/appError";
import { SLAB_STATUS } from "../constants";
import { sequelize } from "../config/database";
import { WhereOptions } from "sequelize";
import _ from "lodash";

import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as slabRepository from "../repositories/slab.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import { LOADING_ORDER_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { removeDuplicates } from "../helper";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(data);
  loadingOrder = loadingOrder.get({ plain: true });

  let updatedProducts = [];

  if (data?.soProducts) {
    // Set loadingOrderId and stage to loadingOrder for each product.
    data.soProducts = data.soProducts.map((e: any) => ({
      ...e,
      loadingOrderId: loadingOrder.id,
      stage: SALE_ORDER_PRODUCT_STAGES.LOADING_ORDER,
    }));

    updatedProducts = await salesOrderProductService.upsertSalesOrderProducts(data.soProducts, data.salesOrderId);
  } else {
    throw new AppError("SO products are required.", 400);
  }

  return { ...loadingOrder, products: updatedProducts };
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
  loadingOrder.totalAmount = loadingOrder.salesOrderProducts.reduce(
    (total: number, salesOrderProduct: any) =>
      total +
      (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth * salesOrderProduct.unitPrice) / 144,
    0
  );

  let products = removeDuplicates(
    loadingOrder?.salesOrderProducts.map((salesOrderProduct: any) => salesOrderProduct.inventoryProduct.slab.product)
  );

  // Map slabs to products
  loadingOrder.products = products.map((product) => {
    const salesOrderProduct = loadingOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) => salesOrderProduct.inventoryProduct.slab.product.id === product.id
    );

    return { ...product, salesOrderProduct };
  });

  // delete salesOrder.salesOrderProducts because it is in products;
  delete loadingOrder.salesOrderProducts;

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
      loadingOrder.salesOrderProducts,
      (salesOrderProduct: any) =>
        (salesOrderProduct.loRemeasureLength * salesOrderProduct.loRemeasureWidth * salesOrderProduct.unitPrice) / 144
    );

    return loadingOrder;
  });
}

import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as packagingListRepository from "../repositories/packagingList.repository";
import { PACKAGING_LIST_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { removeDuplicatesWithUnitPrice } from "../helper";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";
import { getTotalLoOrderQuantity, getTotalPlAmount } from "./packagingList.service";
import _ from "lodash";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as packagingListService from "../services/packagingList.service";

// Create new PL
export const createLoadingOrder = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    const packagingList = (await packagingListRepository.getPackagingListByIdSimple(data.packagingListId))?.get({
      plain: true,
    });

    let loadingOrder: any = await loadingOrderRepository.createLoadingOrder(
      { ...data, salesOrderId: packagingList.salesOrderId },
      transaction
    );
    loadingOrder = loadingOrder.get({ plain: true });

    let updatedProducts = [];

    if (data?.soProducts) {
      // Set loadingOrderId and stage for each product
      const productsToUpdate = data.soProducts.map((e: any) => ({
        ...e,
        loadingOrderId: loadingOrder.id,
        stage: SALE_ORDER_PRODUCT_STAGES.LOADING_ORDER,
      }));

      // update sales order products with loading order id and stage -> loadingOrder
      updatedProducts = await salesOrderProductService.updateSalesOrderProducts(
        productsToUpdate,
        transaction
      );
    } else {
      throw new AppError("SO products are required.", 400);
    }

    await packagingListRepository.updatePackagingList(
      data.packagingListId,
      { stage: PACKAGING_LIST_STAGES.LOADING_ORDER },
      transaction
    );

    transaction.commit();
    return { loadingOrder, updatedProducts };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Get all PL
export const getAllLoadingOrders = async () => {
  return await loadingOrderRepository.getAllLoadingOrders();
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await loadingOrderRepository.getLoadingOrderById(id);

  if (!loadingOrder) {
    throw new AppError("Invalid Id", 400);
  }

  loadingOrder.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(loadingOrder.salesOrderProducts);

  // Calculations for loading order.
  loadingOrder.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(loadingOrder.salesOrderProducts);

  // get payment terms constant data.
  loadingOrder.packagingList.paymentTerms = PAYMENT_TERMS.find((e) => e.id == loadingOrder.packagingList.paymentTerms);

  loadingOrder.packagingList.salesOrder.customer.salesTax = SALES_TAX.find(
    (e) => e.id == loadingOrder.packagingList.salesOrder.customer.salesTax
  );

  delete loadingOrder.salesOrderProducts;

  return loadingOrder;
};


// Get loading order by PL id
export const getLoadingOrdersBySalesOrderId = async (loadingOrderId: number) => {
  return await loadingOrderRepository.getLoadingOrdersBySalesOrderId(loadingOrderId);
};

// Update loading order
export const updateLoadingOrder = async (id: number, data: any) => {
  return await loadingOrderRepository.updateLoadingOrder(id, data);
};

// Get new LO number
export const getPLNumber = async (clientId: number, salesOrderId?: number) => {
  return await loadingOrderRepository.getPlNumber(clientId, salesOrderId);
};

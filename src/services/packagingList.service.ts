import * as packagingListRepository from "../repositories/packagingList.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { LOADING_ORDER_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { removeDuplicatesWithUnitPrice } from "../helper";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";
import { getTotalLoOrderQuantity, getTotalPlAmount } from "./loadingOrder.service";
import _ from "lodash";

// Create new PL
export const createPackagingList = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(data.loadingOrderId))?.get({
      plain: true,
    });

    let packagingList: any = await packagingListRepository.createPackagingList(
      { ...data, salesOrderId: loadingOrder.salesOrderId },
      transaction
    );
    packagingList = packagingList.get({ plain: true });

    let updatedProducts = [];

    if (data?.soProducts) {
      // Set loadingOrderId and stage to loadingOrder for each product.
      data.soProducts = data.soProducts.map((e: any) => ({
        ...e,
        packagingListId: packagingList.id,
        stage: SALE_ORDER_PRODUCT_STAGES.PACKAGING_LIST,
      }));

      // update sales order products with packaging list id and stage -> packagingList.
      updatedProducts = await salesOrderProductService.upsertSalesOrderProducts(
        data.soProducts,
        loadingOrder.salesOrderId,
        transaction
      );
    } else {
      throw new AppError("SO products are required.", 400);
    }

    // Update loading order stage to packagingList.
    await loadingOrderRepository.updateLoadingOrder(
      data.loadingOrderId,
      { stage: LOADING_ORDER_STAGES.PACKAGING_LIST },
      transaction
    );

    transaction.commit();
    return { packagingList, updatedProducts };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Get all PL
export const getAllPackagingLists = async () => {
  return await packagingListRepository.getAllPackagingLists();
};

// Get packaging list by Id
export const getPackagingListById = async (id: number) => {
  const packagingList = await packagingListRepository.getPackagingListById(id);

  if (!packagingList) {
    throw new AppError("Invalid Id", 400);
  }

  const salesTax = SALES_TAX.find(e => e.id == packagingList.loadingOrder.salesOrder.customer.salesTax);

  if (!salesTax) {
    throw new AppError('Error in getting tax value', 400);
  }


  packagingList.products = getPackagingListProductAccordingToIdAndUnitPrice(packagingList);

  // Calculate total pl amount added in SO.
  packagingList.amounts = getTotalPlAmount(packagingList.salesOrderProducts, salesTax.value);

  // get payment terms constant data.
  packagingList.loadingOrder.paymentTerms = PAYMENT_TERMS.find((e) => e.id == packagingList.loadingOrder.paymentTerms);

  packagingList.loadingOrder.salesOrder.customer.salesTax = SALES_TAX.find(
    (e) => e.id == packagingList.loadingOrder.salesOrder.customer.salesTax
  );

  delete packagingList.salesOrderProducts;

  return packagingList;
};

function getTotalPLQuantity(salesOrderProducts: any[]) {
  return _.sumBy(
    salesOrderProducts,
    (salesOrderProduct: any) => (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth) / 144
  );
}

function getPackagingListProductAccordingToIdAndUnitPrice(packagingList: any) {
  let products = removeDuplicatesWithUnitPrice(
    packagingList?.salesOrderProducts.map((salesOrderProduct: any) => ({
      ...salesOrderProduct.inventoryProduct.slab.product,
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const newProducts = products.map((product) => {
    const salesOrderProduct = packagingList.salesOrderProducts.filter(
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.product.id === product.id &&
        salesOrderProduct.unitPrice === product.unitPrice
    );

    return {
      ...product,
      taxApplied: !!salesOrderProduct[0].taxApplied,
      totalQuantity: getTotalPLQuantity(salesOrderProduct),
      totalOrderQuantity: getTotalLoOrderQuantity(salesOrderProduct),
      salesOrderProduct,
    };
  });

  return newProducts;
}

// Get packaging list by LO id
export const getPackagingListsBySalesOrderId = async (loadingOrderId: number) => {
  return await packagingListRepository.getPackagingListsBySalesOrderId(loadingOrderId);
};

// Update packaging list
export const updatePackagingList = async (id: number, data: any) => {
  return await packagingListRepository.updatePackagingList(id, data);
};

// Get new PL number
export const getPLNumber = async (clientId: number) => {
  return await packagingListRepository.getPlNumber(clientId);
};

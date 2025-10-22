import _ from "lodash";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";
import * as loadingOrderService from '../services/loadingOrder.service'
import { AppError } from "../helper/appError";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";
import { removeDuplicatesWithUnitPrice } from "../helper";
import { getTotalLOQuantity } from "./loadingOrder.service";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";

export const fetchTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {
  return await salesOrderInvoiceRepository.getTotalAmountFromLastNDays(fromDate, toDate, clientId);
};

export const getTotalAmountForClient = async (clientId: number) => {
  return await salesOrderInvoiceRepository.getTotalAmountForClient(clientId);
};

export const assignTruck = async (id: number, truckId: number) => {
  const soInvoice = (await salesOrderInvoiceRepository.getInvoiceById(id))?.get({ plain: true });

  if (!soInvoice) {
    throw new AppError("Invoice does not exists.", 400);
  }

  return await salesOrderInvoiceRepository.assignTruck(id, truckId);
};

export const getInvoiceById = async (id: number) => {
  const soInvoice = (await salesOrderInvoiceRepository.getInvoiceDetailsById(id))?.get({ plain: true });

  if (!soInvoice) {
    throw new AppError("Invoice does not exists.", 400);
  }

  soInvoice.products = getLoadingOrderProductAccordingToIdAndUnitPrice(soInvoice.loadingOrder);

  const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(soInvoice.loadingOrder.salesOrderProducts)

  return {
    ...soInvoice,
    calculations,
  };
};

function getLoadingOrderProductAccordingToIdAndUnitPrice(loadingOrder: any) {
  let products = removeDuplicatesWithUnitPrice(
    loadingOrder?.salesOrderProducts.map((salesOrderProduct: any) => ({
      ...(salesOrderProduct.inventoryProduct.slab?.product || salesOrderProduct.inventoryProduct.genericProduct?.product),
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const newProducts = products.map((product) => {
    const salesOrderProducts = loadingOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) => {

        let productId = null;
        if (salesOrderProduct.inventoryProduct.slab) {
          productId = salesOrderProduct.inventoryProduct.slab.product.id;
        } else if (salesOrderProduct.inventoryProduct.genericProduct) {
          productId = salesOrderProduct.inventoryProduct.genericProduct.product.id;
        }

        return (productId === product.id)
          &&
          (salesOrderProduct.unitPrice == product.unitPrice)

      });

    const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(salesOrderProducts)

    return {
      ...product,
      salesOrderProduct: salesOrderProducts,
      calculations,
      totalQuantity: getTotalLOQuantity(salesOrderProducts, product?.isSlabType),
    };
  });

  return newProducts;
}

export const getAllSoInvoiceList = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit);

  data.rows = data.rows.map((invoice: any) => {
    invoice = invoice.get({ plain: true });

    if (invoice.loadingOrder.packagingList) {
      invoice.totalQuantity = _.sumBy(
        invoice.loadingOrder.salesOrderProducts,
        (item: any) => item.plRemeasureLength * item.plRemeasureWidth
      );
    } else {
      invoice.totalQuantity = _.sumBy(
        invoice.loadingOrder.salesOrderProducts,
        (item: any) => item.loRemeasureLength * item.loRemeasureWidth
      );
    }

    invoice.totalSlabs = invoice.loadingOrder.salesOrderProducts.length;

    return { ...invoice };
  });

  return data;
};

export const getAllSoInvoiceListWithTruckOnly = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit, true);

  data.rows = data.rows.map((invoice: any) => {
    invoice = invoice.get({ plain: true });

    if (invoice.loadingOrder.packagingList) {
      invoice.totalQuantity = _.sumBy(
        invoice.loadingOrder.salesOrderProducts,
        (item: any) => item.plRemeasureLength * item.plRemeasureWidth
      );
    } else {
      invoice.totalQuantity = _.sumBy(
        invoice.loadingOrder.salesOrderProducts,
        (item: any) => item.loRemeasureLength * item.loRemeasureWidth
      );
    }

    invoice.totalSlabs = invoice.loadingOrder.salesOrderProducts.length;

    return { ...invoice };
  });

  return data;
};

/**
 * Get sales order products without returns for a specific invoice
 */
export const getSalesOrderProductsWithoutReturns = async (soInvoiceId: number) => {
  const soInvoice = await salesOrderInvoiceRepository.getInvoiceById(soInvoiceId);

  if (!soInvoice) {
    throw new AppError("Invoice does not exist.", 404);
  }

  const products = await salesOrderInvoiceRepository.getSalesOrderProductsWithoutReturns(soInvoiceId);
  return products;
};

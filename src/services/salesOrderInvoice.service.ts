import _ from "lodash";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";
import { AppError } from "../helper/appError";
import { PAYMENT_TERMS } from "../constants";
import { removeDuplicatesWithUnitPrice } from "../helper";
import { getTotalLOQuantity } from "./loadingOrder.service";

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

  soInvoice.customer.paymentTerms = PAYMENT_TERMS.find((e) => e.id == soInvoice.customer.paymentTerms);

  soInvoice.products = getLoadingOrderProductAccordingToIdAndUnitPrice(soInvoice.loadingOrder);

  return soInvoice;
};

function getLoadingOrderProductAccordingToIdAndUnitPrice(loadingOrder: any) {
  let products = removeDuplicatesWithUnitPrice(
    loadingOrder?.salesOrderProducts.map((salesOrderProduct: any) => ({
      ...salesOrderProduct.inventoryProduct.slab.product,
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const newProducts = products.map((product) => {
    const salesOrderProduct = loadingOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.product.id === product.id &&
        salesOrderProduct.unitPrice === product.unitPrice
    );

    return {
      ...product,
      salesOrderProduct,
      totalQuantity: getTotalLOQuantity(salesOrderProduct),
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

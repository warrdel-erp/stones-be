import _ from "lodash";
import { AppError } from "../helper/appError";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";
import * as packagingListService from '../services/packagingList.service';
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";

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

  let relevantProducts = [];

  if (soInvoice.loadingOrderId) {
    // It's a Loading Order Invoice
    relevantProducts = soInvoice.loadingOrder?.salesOrderProducts || [];
  } else if (soInvoice.packagingListId) {
    // It's a Packaging List Invoice
    // Filter to only products that are NOT assigned to an LO
    relevantProducts = (soInvoice.packagingList?.salesOrderProducts || []).filter((p: any) => p.loadingOrderId === null);
  }

  soInvoice.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(relevantProducts);

  const calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(relevantProducts)

  return {
    ...soInvoice,
    calculations,
  };
};

export const getAllSoInvoiceList = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit);

  data.rows = data.rows.map((invoice: any) => {
    const finalAmount = invoice.finalAmount;
    invoice = invoice.get({ plain: true });

    let relevantProducts = [];
    if (invoice.loadingOrderId) {
      relevantProducts = invoice.loadingOrder?.salesOrderProducts || [];
    } else if (invoice.packagingListId) {
      relevantProducts = (invoice.packagingList?.salesOrderProducts || []).filter((p: any) => p.loadingOrderId === null);
    }

    invoice.totalQuantity = _.sumBy(
      relevantProducts,
      (item: any) => item.isSlabType ? item.finalSqrFt : 1
    );

    invoice.totalSlabs = relevantProducts.filter((salesOrderProduct: any) => salesOrderProduct.isSlabType).length;
    invoice.totalGenericProducts = relevantProducts.length - invoice.totalSlabs;
    invoice.finalAmount = finalAmount;

    return { ...invoice };
  });

  return data;
};

export const getAllSoInvoiceListWithTruckOnly = async (clientId: number, filter: any, page: number, limit: number) => {
  const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit, true);

  data.rows = data.rows.map((invoice: any) => {
    const finalAmount = invoice.finalAmount;
    invoice = invoice.get({ plain: true });

    if (invoice.packagingList.loadingOrder) {
      invoice.totalQuantity = _.sumBy(
        invoice.packagingList.salesOrderProducts,
        (item: any) => item.loRemeasureLength * item.loRemeasureWidth
      );
    } else {
      invoice.totalQuantity = _.sumBy(
        invoice.packagingList.salesOrderProducts,
        (item: any) => item.plRemeasureLength * item.plRemeasureWidth
      );
    }

    invoice.totalSlabs = invoice.packagingList.salesOrderProducts.length;
    invoice.finalAmount = finalAmount;

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

export const getOverdueInvoices = async (clientId: number, customerId?: number) => {
  const invoices = await salesOrderInvoiceRepository.getOverdueInvoicesRaw(clientId, customerId);

  const overdueUnpaidInvoices = [];
  const today = new Date();

  for (const invoice of invoices) {
    const plainInvoice = invoice.get({ plain: true });

    // Dynamic Due Date Calculation: Lo Date + payment terms
    const dueDate = new Date(plainInvoice.packagingList.plDate);
    const paymentTermId = plainInvoice.packagingList.paymentTermId || plainInvoice.packagingList.salesOrder?.paymentTermId;

    if (paymentTermId) {
      const term = PAYMENT_TERMS.find(t => t.id === paymentTermId);
      if (term && term.value !== "COD") {
        dueDate.setDate(dueDate.getDate() + parseInt(term.value));
      }
    }

    if (dueDate < today) {
      const paidAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
        plainInvoice.id,
        PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE
      );

      if (paidAmount < plainInvoice.finalAmount) {
        overdueUnpaidInvoices.push({
          ...plainInvoice,
          dueDate,
          paidAmount,
          balanceAmount: Number((plainInvoice.finalAmount - paidAmount).toFixed(2)),
        });
      }
    }
  }

  return overdueUnpaidInvoices;
};
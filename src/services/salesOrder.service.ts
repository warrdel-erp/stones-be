import { sequelize } from "../config/database";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as notesRepository from "../repositories/notes.repository";
import { removeDuplicatesWithUnitPrice } from "../helper";
import _ from "lodash";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { SALES_TAX, SCOP } from "../constants";

export const createSalesOrder = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    const salesOrder: any = await salesOrderRepository.createSalesOrder(data, transaction);

    // Set stage to salesOrder for each product.
    data.products = data.products.map((product: any) => ({ ...product, stage: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER }));

    const salesOrderProducts = await salesOrderProductService.upsertSalesOrderProducts(
      data.products,
      salesOrder.id,
      transaction
    );

    // Create internal note (if provided)
    let internalNote: any = null;
    if (data?.internalNote) {
      internalNote = await notesRepository.createNote(
        {
          description: data?.internalNote,
          type: "internal",
          referenceType: "sales_order",
          referenceId: salesOrder?.id,
        },
        transaction
      );
    }

    // Create printable note (if provided)
    let printableNote: any = null;
    if (data?.printableNote) {
      printableNote = await notesRepository.createNote(
        {
          description: data?.printableNote,
          type: "printable",
          referenceType: "sales_order",
          referenceId: salesOrder?.id, // Temporarily null, updated after PO creation
        },
        transaction
      );
    }

    await transaction.commit();
    return { salesOrder, salesOrderProducts, internalNote, printableNote };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get all sales orders
export const getAllSalesOrders = async (
  page: number,
  limit: number,
  clientId: number,
  filter: { [key: string]: string }
) => {
  let data: any;
  if (filter.tab == "LOADING_ORDER") {
    data = await salesOrderRepository.getAllSalesOrdersOnlyWithLoadingOrder(page, limit, clientId);
  } else if (filter.tab == "PACKAGING_LIST") {
    data = await salesOrderRepository.getAllSalesOrdersOnlyWithPackagingList(page, limit, clientId);
  } else if (filter.tab == "OPEN") {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId, { status: SALES_ORDER_STATUS.OPEN });
  } else if (filter.tab == "CLOSED") {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId, { status: SALES_ORDER_STATUS.CLOSED });
  } else {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId);
  }

  data.data = data.data.map((salesOrder: any) => {
    salesOrder = salesOrder.get({ plain: true });

    salesOrder.customer.salesTax = SALES_TAX.find((e) => e.id == salesOrder.customer.salesTax);
    salesOrder.customer.scope = SCOP.find((e) => e.id == salesOrder.customer.scope)?.value;

    salesOrder.totalAmount = getTotalAmount(salesOrder.salesOrderProducts);

    return salesOrder;
  }) as any;

  return data;
};

// Get sales order by ID
export const getSalesOrderById = async (id: number) => {
  const salesOrder: any = (await salesOrderRepository.getSalesOrderById(id))?.get({ plain: true });

  // add total to loadingOrders.
  salesOrder.loadingOrders = await loadingOrderService.getAllLoadingOrdersWithoutPagination({
    salesOrderId: id,
  });

  salesOrder.customer.salesTax = SALES_TAX.find((e) => e.id == salesOrder.customer.salesTax);
  salesOrder.customer.scope = SCOP.find((e) => e.id == salesOrder.customer.scop)?.value;

  // Total amount and total quantity calculation.
  salesOrder.totalAmount = getTotalAmount(salesOrder.salesOrderProducts);
  salesOrder.totalQty = getTotalQuantity(salesOrder.salesOrderProducts);

  // Group Products by productId and unit price.
  salesOrder.products = getSalesOrderProductAccordingToIdAndUnitPrice(salesOrder);

  // delete salesOrder.salesOrderProducts because it is in products;
  delete salesOrder.salesOrderProducts;

  return salesOrder;
};

// Get new PO number
export const getSONumber = async (clientId: number) => {
  return await salesOrderRepository.getSoNumber(clientId);
};

export function getTotalQuantity(salesOrderProducts: any[]) {
  return (
    _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.receivingLength * salesOrderProduct.inventoryProduct.slab.receivingWidth
    ) / 144
  );
}

function getTotalAmount(salesOrderProducts: any) {
  return (
    _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.receivingLength *
        salesOrderProduct.inventoryProduct.slab.receivingWidth *
        salesOrderProduct.unitPrice
    ) / 144
  );
}

function getSalesOrderProductAccordingToIdAndUnitPrice(salesOrder: any) {
  let products = removeDuplicatesWithUnitPrice(
    salesOrder?.salesOrderProducts.map((salesOrderProduct: any) => ({
      ...salesOrderProduct.inventoryProduct.slab.product,
      unitPrice: salesOrderProduct.unitPrice,
    }))
  );

  // Map slabs to products
  const newProducts = products.map((product) => {
    const salesOrderProduct = salesOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.product.id === product.id &&
        salesOrderProduct.unitPrice === product.unitPrice
    );

    // remaining products means -> products not yet gone in loadingOrder.
    const totalRemainingSoProducts = salesOrderProduct.filter(
      (e: any) => e.stage === SALE_ORDER_PRODUCT_STAGES.SALES_ORDER
    );

    return {
      ...product,
      taxApplied: !!salesOrderProduct[0].taxApplied,
      salesOrderProduct,
      totalAmount: getTotalAmount(salesOrderProduct),
      totalQuantity: getTotalQuantity(salesOrderProduct),
      totalRemainingQty: getTotalQuantity(totalRemainingSoProducts),
    };
  });

  return newProducts;
}

// Get count of open purchase orders by client
export const getOpenSOCountByClient = async (clientId: number) => {
  const count = await salesOrderRepository.countOpenSOByClientId(clientId);
  return { count };
};

import { sequelize } from "../config/database";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as notesRepository from "../repositories/notes.repository";
import { removeDuplicates, removeDuplicatesWithUnitPrice } from "../helper";
import _ from "lodash";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { SALES_TAX } from "../constants";

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
export const getAllSalesOrders = async (page: number, limit: number) => {
  const data = await salesOrderRepository.getAllSalesOrders(page, limit);

  data.data = data.data.map((salesOrder: any) => {
    salesOrder = salesOrder.get({ plain: true });

    salesOrder.customer.salesTax = SALES_TAX.find((e) => e.id == salesOrder.customer.salesTax);

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

  // Total amount and total quantity calculation.
  salesOrder.totalAmount = getTotalAmount(salesOrder);
  salesOrder.totalQty = getTotalQuantity(salesOrder);

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

function getTotalQuantity(salesOrder: any) {
  return (
    _.sumBy(
      salesOrder.salesOrderProducts,
      (salesOrderProduct: any) =>
        salesOrderProduct.inventoryProduct.slab.receivingLength * salesOrderProduct.inventoryProduct.slab.receivingWidth
    ) / 144
  );
}

function getTotalAmount(salesOrder: any) {
  return (
    _.sumBy(
      salesOrder.salesOrderProducts,
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

    return { ...product, salesOrderProduct };
  });

  return newProducts;
}

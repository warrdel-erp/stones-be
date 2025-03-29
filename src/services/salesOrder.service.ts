import { sequelize } from "../config/database";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as notesRepository from "../repositories/notes.repository";
import { removeDuplicates } from "../helper";
import _ from "lodash";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

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
  return await salesOrderRepository.getAllSalesOrders(page, limit);
};

// Get sales order by ID
export const getSalesOrderById = async (id: number) => {
  const salesOrder: any = (await salesOrderRepository.getSalesOrderById(id))?.get({ plain: true });

  // Calculate total amount added in SO.
  salesOrder.totalAmount = salesOrder.salesOrderProducts.reduce(
    (total: number, salesOrderProduct: any) =>
      total +
      (salesOrderProduct.inventoryProduct.slab.receivingLength *
        salesOrderProduct.inventoryProduct.slab.receivingWidth *
        salesOrderProduct.unitPrice) /
        144,
    0
  );

  // add total to loadingOrders.
  salesOrder.loadingOrders = await loadingOrderService.getAllLoadingOrdersWithoutPagination({
    salesOrderId: id,
  });

  // Calculate total qty added in SO.
  salesOrder.totalQty = salesOrder.salesOrderProducts.reduce(
    (total: number, salesOrderProduct: any) =>
      total +
      (salesOrderProduct.inventoryProduct.slab.receivingLength *
        salesOrderProduct.inventoryProduct.slab.receivingWidth) /
        144,
    0
  );

  let products = removeDuplicates(
    salesOrder?.salesOrderProducts.map((salesOrderProduct: any) => salesOrderProduct.inventoryProduct.slab.product)
  );

  // Map slabs to products
  salesOrder.products = products.map((product) => {
    const salesOrderProduct = salesOrder.salesOrderProducts.filter(
      (salesOrderProduct: any) => salesOrderProduct.inventoryProduct.slab.product.id === product.id
    );
    // .map((salesOrderProduct: any) => salesOrderProduct.inventoryProduct.slab);

    return { ...product, salesOrderProduct };
  });

  // delete salesOrder.salesOrderProducts because it is in products;
  delete salesOrder.salesOrderProducts;

  return salesOrder;
};

// Get new PO number
export const getSONumber = async (clientId: number) => {
  return await salesOrderRepository.getSoNumber(clientId);
};

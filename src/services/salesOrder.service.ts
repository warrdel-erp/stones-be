import _ from "lodash";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { SALES_TAX } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS, ACTIVITY_TYPE, ACTIVITY_REFERENCE_TYPE } from "../constants/tableTypes";
import * as activityService from "../services/activity.service";
import { getPercentageValueFromValue, removeDuplicatesWithUnitPrice } from "../helper";
import * as customerRepository from "../repositories/customer.repository";
import * as notesRepository from "../repositories/notes.repository";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as cartItemService from "../services/cartItem.service";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderService from "../services/loadingOrder.service";


export const createSalesOrder = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    // Fetch customer to get taxId
    if (data.customerId) {
      const customer = await customerRepository.getCustomerByIdSimple(data.customerId);
      data.taxId = customer?.salesTaxId;
    }

    // If cart item exists for any inventory product then first delete it before creating new sales order with account validation
    await validateAndDeleteCartItemForInventoryProductId(data, transaction);

    // Create sales order
    const salesOrder: any = await salesOrderRepository.createSalesOrder(data, transaction);

    // Create sales order products
    const salesOrderProducts = await salesOrderProductService.createSalesOrderProducts(
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

    await activityService.logActivity(
      {
        clientId: salesOrder.clientId,
        activityType: ACTIVITY_TYPE.SALES_ORDER_CREATION,
        referenceId: salesOrder.id,
        referenceType: ACTIVITY_REFERENCE_TYPE.SALES_ORDER,
        title: "Sales Order Created",
        description: `Sales Order #${salesOrder.clientSoNumber} was created successfully.`,
        locationId: salesOrder.locationId,
      },
      transaction
    );

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

    salesOrder.totalAmount = getTotalAmount(salesOrder.salesOrderProducts);

    salesOrder.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(salesOrder.salesOrderProducts);
    salesOrder.fulFilled = getPercentageValueFromValue(salesOrder.salesOrderProducts.length, salesOrder.salesOrderProducts.filter((e: any) => e.stage === SALE_ORDER_PRODUCT_STAGES.INVOICED).length)

    return salesOrder;
  }) as any;

  return data;
};

// Get sales order by ID
export const getSalesOrderById = async (id: number) => {
  const salesOrder: any = (await salesOrderRepository.getSalesOrderById(id))?.get({ plain: true });

  salesOrder.totalAdvancedDeposit = _.sumBy(salesOrder.advancedDeposits, (e: any) => Number(e.amount));

  // Calculations for sales order products.
  salesOrder.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(salesOrder.salesOrderProducts);

  // Calculations for LoadingOrder
  salesOrder.loadingOrders = salesOrder.loadingOrders.map((loadingOrder: any) => {
    loadingOrder.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(loadingOrder.salesOrderProducts);
    delete loadingOrder.salesOrderProducts;
    return loadingOrder;
  });

  // Group Products by productId and unit price.
  salesOrder.products = loadingOrderService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(salesOrder.salesOrderProducts);

  // delete salesOrder.salesOrderProducts because it is in products;
  delete salesOrder.salesOrderProducts;

  return salesOrder;
};

// Get sales order by ID
export const getSalesOrderByIdForCreateLO = async (id: number) => {
  const salesOrder: any = (await salesOrderRepository.getSalesOrderByIdForCreateLO(id))?.get({ plain: true });

  if (!!salesOrder?.salesOrderProducts) {
    // Group Products by productId and unit price.
    salesOrder.products = loadingOrderService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(salesOrder.salesOrderProducts);

    // delete salesOrder.salesOrderProducts because it is in products;
    delete salesOrder.salesOrderProducts;
  }

  return salesOrder;
};

// Get new PO number
export const getSONumber = async (clientId: number) => {
  return await salesOrderRepository.getSoNumber(clientId);
};

async function validateAndDeleteCartItemForInventoryProductId(data: any, transaction: Transaction) {
  if (data.products && Array.isArray(data.products) && data.accountId) {

    const inventoryProductIds = data.products
      .map((product: any) => product.inventoryProductId)
      .filter((id: any) => id !== undefined && id !== null);

    if (inventoryProductIds.length > 0) {
      // Validate cart items exist and belong to the accountId
      await cartItemService.validateCartItemsByInventoryProductIds(
        inventoryProductIds,
        data.accountId,
        transaction
      );

      // Delete cart items after validation
      await cartItemService.deleteCartItemsByInventoryProductIds(
        inventoryProductIds,
        data.accountId,
        transaction
      );
    }
  }
}

export function getTotalQuantity(salesOrderProducts: any[]) {
  return (
    _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) =>
        salesOrderProduct?.inventoryProduct?.slab?.receivingLength * salesOrderProduct?.inventoryProduct?.slab?.receivingWidth
    ) / 144
  );
}

function getTotalAmount(salesOrderProducts: any) {

  // if salesOrderProduct.inventoryProduct.isSlabType is false then just add unit Price

  return (
    _.sumBy(
      salesOrderProducts,
      (salesOrderProduct: any) => {

        if (salesOrderProduct.inventoryProduct.isSlabType) {
          return Number(salesOrderProduct?.inventoryProduct?.slab?.receivingLength *
            salesOrderProduct?.inventoryProduct?.slab?.receivingWidth *
            salesOrderProduct?.unitPrice / 144)
        }

        return Number(salesOrderProduct?.unitPrice)
      }
    )
  );
}

// Get count of open purchase orders by client
export const getOpenSOCountByClient = async (clientId: number) => {
  const count = await salesOrderRepository.countOpenSOByClientId(clientId);
  return { count };
};


export const getPaidAmountForSO = (id: number) => {
  return salesOrderRepository.getTotalPaidAmountForSO(id);
}
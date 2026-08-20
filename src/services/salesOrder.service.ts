import _ from "lodash";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { SALES_TAX } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS, ACTIVITY_TYPE, ACTIVITY_REFERENCE_TYPE, HOLD_STAGES } from "../constants/tableTypes";
import * as activityService from "../services/activity.service";
import { getPercentageValueFromValue, removeDuplicatesWithUnitPrice } from "../helper";
import * as customerRepository from "../repositories/customer.repository";
import * as notesRepository from "../repositories/notes.repository";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as cartItemService from "../services/cartItem.service";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as packagingListService from "../services/packagingList.service";
import * as holdRepository from "../repositories/hold.repository";
import { AppError } from "../helper/appError";
import * as models from "../models";
import { decimalAdd } from "../helper/decimal";
import { isHoldClosed } from "../utils/hold.util";


import * as opportunityRepository from "../repositories/opportunity.repository";

export const createSalesOrder = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    // Fetch customer to get taxId
    if (data.customerId) {
      const customer = await customerRepository.getCustomerByIdSimple(data.customerId);
      data.taxId = customer?.salesTaxId;
    }

    let holdObj: any = null;
    if (data.holdId) {
      holdObj = await holdRepository.getHoldById(data.holdId);
      if (!holdObj) {
        throw new AppError("Hold not found", 404);
      }
      if (isHoldClosed(holdObj)) {
        throw new AppError("A Sales Order cannot be created from a closed Hold.", 400);
      }
    }

    // If cart item exists for any inventory product then first delete it before creating new sales order with account validation
    await validateAndDeleteCartItemForInventoryProductId(data, transaction);

    // Create sales order
    const salesOrder: any = await salesOrderRepository.createSalesOrder(data, transaction);

    // Update hold stage to soCreated if holdId is specified
    if (data.holdId) {
      if (!data.quotationId) {
        await holdRepository.updateHold(
          data.holdId,
          { stage: HOLD_STAGES.SO_CREATED },
          transaction
        );
      }

      if (holdObj && holdObj.opportunityId) {
        await opportunityRepository.updateOpportunity(
          holdObj.opportunityId,
          data.clientId,
          { status: "SALES_ORDER" },
          transaction
        );

        if (!data.quotationId) {
          // Mark all Opportunity Quotations as SUPERSEDED by this Hold
          await models.OpportunityQuotation.update(
            { status: "SUPERSEDED", supersededByHoldId: data.holdId },
            { where: { opportunityId: holdObj.opportunityId, clientId: data.clientId }, transaction }
          );
        }
      }
    }

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
  filter: { [key: string]: any }
) => {
  let data: any;
  const search = filter.search;
  
  // Clean filter by removing tab and search
  const cleanFilter = { ...filter };
  delete cleanFilter.tab;
  delete cleanFilter.search;

  if (filter.tab == "PACKAGING_LIST") {
    data = await salesOrderRepository.getAllSalesOrdersOnlyWithPackagingList(page, limit, clientId, search);
  } else if (filter.tab == "LOADING_ORDER") {
    data = await salesOrderRepository.getAllSalesOrdersOnlyWithLoadingOrder(page, limit, clientId, search);
  } else if (filter.tab == "OPEN") {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId, { ...cleanFilter, status: SALES_ORDER_STATUS.OPEN }, search);
  } else if (filter.tab == "CLOSED") {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId, { ...cleanFilter, status: SALES_ORDER_STATUS.CLOSED }, search);
  } else {
    data = await salesOrderRepository.getAllSalesOrders(page, limit, clientId, cleanFilter, search);
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

  // Calculations for PackagingList
  salesOrder.loadingOrders = salesOrder.loadingOrders.map((packagingList: any) => {
    packagingList.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);
    delete packagingList.salesOrderProducts;
    return packagingList;
  });

  // Group Products by productId and unit price.
  salesOrder.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(salesOrder.salesOrderProducts);

  // delete salesOrder.salesOrderProducts because it is in products;
  delete salesOrder.salesOrderProducts;

  return salesOrder;
};

// Get sales order by ID
export const getSalesOrderByIdForCreateLO = async (id: number) => {
  const salesOrder: any = (await salesOrderRepository.getSalesOrderByIdForCreateLO(id))?.get({ plain: true });

  if (!!salesOrder?.salesOrderProducts) {
    // Group Products by productId and unit price.
    salesOrder.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(salesOrder.salesOrderProducts);

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


export const getPaidAmountForSO = async (id: number) => {
  const invoiceIds = await salesOrderRepository.getInvoiceIdsForSalesOrder(id);
  const paymentBillSum = await salesOrderRepository.getPaymentBillsSumForInvoices(invoiceIds);
  const settlementSum = await salesOrderRepository.getAdvancedDepositSettlementsSumForInvoices(invoiceIds);
  const totalPaidAmount = decimalAdd(paymentBillSum, settlementSum);
  return {
    id,
    totalPaidAmount,
  };
};

export const updateSalesOrderTax = async (id: number, taxId: number, clientId: number) => {
  const transaction = await sequelize.transaction();
  try {
    const salesOrder: any = await salesOrderRepository.getSimpleSalesOrder(id, transaction);
    if (!salesOrder) {
      throw new AppError("Sales Order not found", 404);
    }
    if (salesOrder.clientId !== clientId) {
      throw new AppError("Unauthorized access to this Sales Order", 403);
    }

    // Check if there are any invoices
    const invoiceCount = await models.SalesOrderInvoice.count({
      where: { salesOrderId: id },
      transaction,
    });
    if (invoiceCount > 0) {
      throw new AppError("Tax can be changed only before the first invoice has been created for this Sales Order.", 400);
    }

    // Find the new tax percentage
    const taxMatch = SALES_TAX.find((t) => t.id === taxId);
    if (!taxMatch) {
      throw new AppError("Invalid Tax ID selected", 400);
    }

    // Update SalesOrder taxId
    await salesOrder.update({ taxId }, { transaction });

    // Update taxPercentage on all SalesOrderProducts where taxApplied is true
    await models.SalesOrderProduct.update(
      { taxPercentage: taxMatch.value },
      {
        where: {
          salesOrderId: id,
          taxApplied: true,
        },
        transaction,
      }
    );

    await activityService.logActivity(
      {
        clientId: salesOrder.clientId,
        activityType: ACTIVITY_TYPE.SALES_ORDER_CREATION,
        referenceId: salesOrder.id,
        referenceType: ACTIVITY_REFERENCE_TYPE.SALES_ORDER,
        title: "Sales Order Tax Updated",
        description: `Sales Order #${salesOrder.clientSoNumber} tax was updated to ${taxMatch.label} (${taxMatch.value}%).`,
        locationId: salesOrder.locationId,
      },
      transaction
    );

    await transaction.commit();
    
    // Fetch and return the updated sales order with associations
    const updatedSalesOrder = await getSalesOrderById(id);
    return updatedSalesOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
import * as poRepository from "../repositories/purchaseOrder.repository";
import { sequelize } from "../config/database";
import * as notesRepository from "../repositories/notes.repository";
import * as requestedPurchaseProductRepository from "../repositories/requestedPurchaseProduct.repository";
import * as siplProductRepository from "../repositories/siplProducts.repository";
import { Transaction } from "sequelize";
import { SCOP } from "../constants";
import * as paymentBillsRepository from '../repositories/paymentBills.repository'
import { PAYMENT_BILL_REFERENCE_TYPES, PO_STATUS, SIPL_STATUS } from "../constants/tableTypes";
import _ from "lodash";
import * as decimal from '../helper/decimal';
import * as siplService from "./sipl.service";
import { AppError } from "../helper/appError";

/**
 * Service to create a Purchase Order along with internal and printable notes.
 */
export const registerPurchaseOrder = async (poData: any, notesData: any, transaction?: Transaction) => {
  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction(); // Start a transaction
  }

  try {
    // Create purchase order
    const newPO: any = await poRepository.createPurchaseOrder(poData, transaction);

    let freightDetail;

    // Create Freight Detail (if provided)
    if (!!Object.keys(poData.freightDetail).length) {
      freightDetail = await poRepository.createFreightDetail(
        poData.freightDetail,
        { purchaseOrderId: newPO.id },
        transaction
      );
    }

    let requestedPurchaseProduct;
    // Create SIPL Products (if provided)
    if (poData.products?.length) {
      requestedPurchaseProduct = await poRepository.createRequestedPurchaseProducts(
        poData.products,
        newPO.id,
        transaction
      );
    }

    // Create internal note (if provided)
    let internalNote: any = null;
    if (notesData?.internal) {
      internalNote = await notesRepository.createNote(
        {
          description: notesData.internal,
          type: "internal",
          referenceType: "purchase_order",
          referenceId: newPO?.id,
        },
        transaction
      );
    }

    // Create printable note (if provided)
    let printableNote: any = null;
    if (notesData?.printable) {
      printableNote = await notesRepository.createNote(
        {
          description: notesData.printable,
          type: "printable",
          referenceType: "purchase_order",
          referenceId: newPO?.id, // Temporarily null, updated after PO creation
        },
        transaction
      );
    }

    if (shouldCommitTransaction) await transaction.commit(); // Commit transaction
    return { ...newPO.get({ plain: true }), internalNote, printableNote, freightDetail, requestedPurchaseProduct };
  } catch (error) {
    if (shouldCommitTransaction) transaction.rollback();
    throw error;
  }
};

export const getAllPurchaseOrders = async (page: number = 1, limit: number = 10, clientId: number, filter?: { [k: string]: string }) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  if (filter && filter.status) {
    const statusMap: { [key: string]: string } = {
      'OPEN': 'open',
      'CANCELLED': 'canceled',
      'CANCELED': 'canceled',
      'CLOSE': 'closed',
      'CLOSED': 'closed',
    };
    const mappedStatus = statusMap[filter.status.toUpperCase()];
    if (mappedStatus) {
      filter.status = mappedStatus;
    }
  }

  let { rows, count }: { rows: any[]; count: any } = { rows: [], count: 0 }

  if (filter?.status == "PAYMENT_PENDING") {
    let result = await poRepository.getPaymentPendingPurchaseOrders(
      page,
      limit,
      clientId,
      filter || {}
    );

    rows = result.rows;
    count = result.count;

  } else {

    let result = await poRepository.getAllPurchaseOrders(
      page,
      limit,
      clientId,
      filter || {}
    );
    rows = result.rows;
    count = result.count;
  }

  rows = await Promise.all(rows.map(async (purchaseOrder) => {

    if (purchaseOrder?.get) {
      purchaseOrder = purchaseOrder.get({ plain: true }); // Convert Sequelize instance to plain object
    }

    // Get vendor scope for purchaseOrder
    purchaseOrder.supplier.vendorScope = SCOP.find((k) => k.id == purchaseOrder.supplier.vendorScope)?.value;

    // Calculate total requested all product's quantity
    purchaseOrder.totalQuantity = purchaseOrder.requestedPurchaseProducts.reduce(
      (total: number, requestedPurchaseProduct: any) => total + requestedPurchaseProduct.quantity,
      0
    );

    // Calculate total requested all product's area
    purchaseOrder.totalAmount = purchaseOrder.requestedPurchaseProducts.reduce(
      (total: number, requestedPurchaseProduct: any) =>
        total + requestedPurchaseProduct.quantity * Number(requestedPurchaseProduct.unitPrice),
      0
    );

    // Calculate total quantity in SIPL for this PO
    purchaseOrder.totalSiplQuantity = purchaseOrder.requestedPurchaseProducts.reduce(
      (total: number, requestedPurchaseProduct: any) =>
        total +
        requestedPurchaseProduct.siplProducts.reduce((sum: number, siplProduct: any) => sum + siplProduct.quantity, 0),
      0
    );

    // Calculate total quantity in SIPL for this PO
    purchaseOrder.totalSiloAmount = purchaseOrder.requestedPurchaseProducts.reduce(
      (total: number, requestedPurchaseProduct: any) =>
        total +
        requestedPurchaseProduct.siplProducts.reduce(
          (sum: number, siplProduct: any) => sum + siplProduct.quantity * Number(siplProduct.unitPrice),
          0
        ),
      0
    );

    purchaseOrder.totalPaidAmount = _.sum(await Promise.all(purchaseOrder.sipls.map((sipl: any) => {
      return paymentBillsRepository.getTotalPaidAmountOfBill(sipl.id, PAYMENT_BILL_REFERENCE_TYPES.SIPL);
    })))

    // Sum all freight bill items across all SIPLs for this PO
    purchaseOrder.totalFreightBills = purchaseOrder.sipls.reduce((sum: number, sipl: any) => {
      const siplBillsTotal = (sipl.bills || []).reduce((billSum: number, bill: any) => {
        const billItemsTotal = (bill.billItems || []).reduce((itemSum: number, item: any) => {
          return decimal.decimalAdd(itemSum, Number(item.amount || 0));
        }, 0);
        return decimal.decimalAdd(billSum, billItemsTotal);
      }, 0);
      return decimal.decimalAdd(sum, siplBillsTotal);
    }, 0);

    return {
      ...purchaseOrder,
    };
  }));

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getPurchaseOrderById = async (id: number) => {
  // Fetch PO details
  let purchaseOrder: any = await poRepository.getPurchaseOrderById(id);

  if (!purchaseOrder) {
    return null; // Handle case where PO does not exist
  }

  // paymentTerm virtual field is now automatically provided by the model
  // Optionally override to just the value if needed:
  // purchaseOrder.paymentTerm = purchaseOrder.paymentTerm?.value;

  // Get vendor scope for purchaseOrder
  purchaseOrder.supplier.vendorScope = SCOP.find((k) => k.id == purchaseOrder.supplier.vendorScope)?.value;

  // Fetch total quantity of requested products for this PO
  const totalQuantity = await requestedPurchaseProductRepository.getTotalQuantityByPurchaseOrder(id);
  const totalSiplQuantity = await siplProductRepository.getTotalQuantityByPurchaseOrder(id);

  // If requestedPurchaseProducts exist, compute totalQuantity per requestedPurchaseProduct
  if (purchaseOrder?.requestedPurchaseProducts) {
    purchaseOrder.requestedPurchaseProducts = purchaseOrder.requestedPurchaseProducts.map((rpp: any) => {

      const fulfilledQuantityBySipl =
        rpp.siplProducts?.reduce((sum: number, sp: any) => sum + (sp.quantity || 0), 0) || 0;

      return {
        ...rpp,
        fulfilledQuantityBySipl,
        leftQuantity: decimal.decimalSubtract(rpp.quantity, fulfilledQuantityBySipl)
      };
    });
  }

  // if sipl exists then calculate total amount for every sipl
  if (purchaseOrder?.sipls) {
    purchaseOrder.sipls = purchaseOrder.sipls.map((sipl: any) => {
      // Total amount of a SIPL

      sipl.totalAmount = sipl.siplProducts.reduce(
        (total: number, siplProduct: any) => total + siplProduct.quantity * Number(siplProduct.unitPrice),
        0
      );

      let filledPackagingCount = 0;
      let filledReceivingCount = 0;
      const statusCounts: { [key: string]: number } = {};

      if (sipl.inventoryProducts) {
        for (const ip of sipl.inventoryProducts) {
          const status = ip.status || "UNKNOWN";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          const slab = ip.slab;
          if (slab) {
            const hasPackaging = slab.packageLength !== null && slab.packageLength !== undefined && slab.packageWidth !== null && slab.packageWidth !== undefined;
            const hasReceiving = slab.receivingLength !== null && slab.receivingLength !== undefined && slab.receivingWidth !== null && slab.receivingWidth !== undefined;
            if (hasPackaging) filledPackagingCount++;
            if (hasReceiving) filledReceivingCount++;
          }
        }
      }

      sipl.inventoryProductsCount = sipl.inventoryProducts?.length || 0;
      sipl.filledPackagingCount = filledPackagingCount;
      sipl.filledReceivingCount = filledReceivingCount;
      sipl.statusCounts = statusCounts;

      // Delete raw inventoryProducts array to optimize payload
      delete sipl.inventoryProducts;

      return {
        ...sipl,
      };
    });
  }

  return {
    ...purchaseOrder,
    totalRequestedQuantity: totalQuantity,
    totalSiplQuantity,
  };
};

// Get SIPL List for PO.
export const getSIPLsForPurchaseOrder = async (purchaseOrderId: number) => {
  const sipls = await poRepository.getSIPLsByPurchaseOrderId(purchaseOrderId);
  return sipls.length > 0 ? sipls : []; // Ensure an empty array if no SIPLs exist
};

// Get new PO number
export const getPONumber = async (clientId: number) => {
  return await poRepository.getPoNumber(clientId);
};

// update po status.
export async function updatePurchaseOrderStatusService(purchaseOrderId: number, status: string) {
  const [updatedCount, updatedPurchaseOrders] = await poRepository.updatePurchaseOrderStatus(purchaseOrderId, status);

  if (updatedCount === 0) {
    throw new Error("PurchaseOrder not found or already has the same status");
  }

  return updatedPurchaseOrders[0];
}

// Get count of open purchase orders by client
export const getOpenPOCountByClient = async (clientId: number) => {
  const count = await poRepository.countOpenPOByClientId(clientId);
  return { count };
};

// Get count of PO in transit
export const getPoInTransit = async (clientId: number) => {
  const count = await poRepository.countPoInTransit(clientId);
  return { count };
};

// Cancel Purchase Order
export const cancelPurchaseOrderService = async (purchaseOrderId: number, locationId: number, clientId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const purchaseOrder = await poRepository.getPurchaseOrderById(purchaseOrderId);
    if (!purchaseOrder) {
      throw new AppError("Purchase Order not found", 404);
    }

    if (purchaseOrder.status === PO_STATUS.CANCELED) {
      throw new AppError("Purchase Order is already canceled.", 400);
    }

    // Check if any SIPL has been received
    const hasReceivedSIPL = purchaseOrder.sipls?.some((sipl: any) => sipl.inventoryReceived);
    if (hasReceivedSIPL) {
      throw new AppError("Cannot cancel Purchase Order because one or more of its SIPLs have already been received.", 400);
    }

    // Cancel all associated SIPLs that are not already canceled
    if (purchaseOrder.sipls && purchaseOrder.sipls.length > 0) {
      for (const sipl of purchaseOrder.sipls) {
        if (sipl.status !== SIPL_STATUS.CANCELED) {
          await siplService.cancelSIPLService(sipl.id, locationId, clientId, transaction);
        }
      }
    }

    // Update PO status to canceled
    await poRepository.updatePurchaseOrderStatus(purchaseOrderId, PO_STATUS.CANCELED, transaction);

    await transaction.commit();
    return { success: true, message: "Purchase Order canceled successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Add product to an existing Purchase Order
export const addRequestedProductToPOService = async (purchaseOrderId: number, productData: any) => {
  const purchaseOrder = await poRepository.getPurchaseOrderById(purchaseOrderId);
  if (!purchaseOrder) {
    throw new AppError("Purchase Order not found", 404);
  }

  if (purchaseOrder.status === PO_STATUS.CANCELED) {
    throw new AppError("Cannot add products to a canceled Purchase Order", 400);
  }

  // Create the requested product
  const newProduct = await requestedPurchaseProductRepository.createProduct({
    productId: productData.productId,
    quantity: productData.quantity,
    unitPrice: productData.unitPrice,
    noOfSlabs: productData.noOfSlabs || null,
    description: productData.description || "",
    supplierNote: productData.supplierNote || null,
    purchaseOrderId,
    clientId: purchaseOrder.clientId,
    locationId: purchaseOrder.locationId,
  });

  return newProduct;
};
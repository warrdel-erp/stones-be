import * as poRepository from "../repositories/purchaseOrder.repository";
import * as soRepository from "../repositories/salesOrder.repository";
import { sequelize } from "../config/database";
import * as notesRepository from "../repositories/notes.repository";
import * as requestedPurchaseProductRepository from "../repositories/requestedPurchaseProduct.repository";
import * as siplProductRepository from "../repositories/siplProducts.repository";
import * as containerService from "../services/container.service";
import { Transaction } from "sequelize";
import { SCOP } from "../constants";
import * as paymentBillsRepository from '../repositories/paymentBills.repository'
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import _ from "lodash";

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

    // Create corresponding container.
    let container;
    if (poData.container) {
      container = await containerService.createContainer({
        number: poData.container,
        referenceType: "purchase_order",
        referenceId: newPO.id,
      });
    }
    let freightDetail;

    // Create Freight Detail (if provided)
    if (poData.freightDetail) {
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

export const getAllPurchaseOrders = async (page: number = 1, limit: number = 10, filter?: { [k: string]: string }) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  let { rows, count }: { rows: any[]; count: any } = { rows: [], count: 0 }

  if (filter?.status == "PAYMENT_PENDING") {
    let result = await poRepository.getPaymentPendingPurchaseOrders(
      page,
      limit,
      filter || {}
    );

    rows = result.rows;
    count = result.count;

  } else {

    let result = await poRepository.getAllPurchaseOrders(
      page,
      limit,
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
    purchaseOrder.totalSiplAmount = purchaseOrder.requestedPurchaseProducts.reduce(
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
      return { ...rpp, fulfilledQuantityBySipl };
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
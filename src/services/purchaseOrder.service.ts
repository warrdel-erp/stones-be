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
import * as productRepository from "../repositories/product.repository";
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
    if (Object.keys(poData.freightDetail).length) {
      freightDetail = await poRepository.createFreightDetail(
        poData.freightDetail,
        { purchaseOrderId: newPO.id },
        transaction
      );
    }

    let requestedPurchaseProduct;
    // Create SIPL Products (if provided)
    if (poData.products?.length) {
      for (const product of poData.products) {
        const prod = await productRepository.findProductById(product.productId, transaction);
        if (!prod) {
          throw new AppError(`Product with ID ${product.productId} not found`, 404);
        }
        if (prod.isSlabType && (product.noOfSlabs === undefined || product.noOfSlabs === null || product.noOfSlabs <= 0)) {
          throw new AppError(`Number of slabs is required for slab product "${prod.name}"`, 400);
        }
      }

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
    const result = await poRepository.getPaymentPendingPurchaseOrders(
      page,
      limit,
      clientId,
      filter || {}
    );

    rows = result.rows;
    count = result.count;

  } else {

    const result = await poRepository.getAllPurchaseOrders(
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
  const purchaseOrder: any = await poRepository.getPurchaseOrderById(id);

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

      const fulfilledSlabsBySipl =
        rpp.siplProducts?.reduce((sum: number, sp: any) => sum + (sp.noOfSlabs || 0), 0) || 0;

      return {
        ...rpp,
        fulfilledQuantityBySipl,
        fulfilledSlabsBySipl,
        leftQuantity: decimal.decimalSubtract(rpp.quantity, fulfilledQuantityBySipl),
        leftNoOfSlabs: decimal.decimalSubtract(rpp.noOfSlabs || 0, fulfilledSlabsBySipl)
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

  const internalNoteObj = purchaseOrder.notes?.find((n: any) => n.type === 'internal');
  const printableNoteObj = purchaseOrder.notes?.find((n: any) => n.type === 'printable');
  if (internalNoteObj) purchaseOrder.internalNote = internalNoteObj.description;
  if (printableNoteObj) purchaseOrder.printableNote = printableNoteObj.description;

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

  const prod = await productRepository.findProductById(productData.productId);
  if (!prod) {
    throw new AppError("Product not found", 404);
  }
  if (prod.isSlabType && (productData.noOfSlabs === undefined || productData.noOfSlabs === null || productData.noOfSlabs <= 0)) {
    throw new AppError(`Number of slabs is required for slab product "${prod.name}"`, 400);
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

export const updatePurchaseOrderService = async (purchaseOrderId: number, poData: any, notesData: any) => {
  const transaction = await sequelize.transaction();

  try {
    const po: any = await poRepository.getPurchaseOrderById(purchaseOrderId);
    if (!po) {
      throw new AppError("Purchase Order not found", 404);
    }

    if (po.status === PO_STATUS.CANCELED || po.status === PO_STATUS.CLOSED) {
      throw new AppError(`Cannot edit a ${po.status} Purchase Order`, 400);
    }

    // Check if PO has any SIPLs
    if (po.sipls && po.sipls.length > 0) {
      throw new AppError("Cannot edit Purchase Order after SIPLs have been created", 400);
    }

    // Check supplier ID edit restriction
    if (poData.supplierId && Number(poData.supplierId) !== Number(po.supplierId)) {
      throw new AppError("Supplier cannot be changed for an existing Purchase Order", 400);
    }

    // Update PurchaseOrder fields
    const poUpdateData: any = {};
    if (poData.poDate) poUpdateData.poDate = poData.poDate;
    if (poData.expiryDate) poUpdateData.expiryDate = poData.expiryDate;
    if (poData.etaDate !== undefined) poUpdateData.etaDate = poData.etaDate;
    if (poData.locationId) poUpdateData.locationId = poData.locationId;
    if (poData.shipmentLocationId) poUpdateData.shipmentLocationId = poData.shipmentLocationId;
    if (poData.paymentTermId !== undefined) poUpdateData.paymentTermId = poData.paymentTermId;
    if (poData.container !== undefined) poUpdateData.container = poData.container;
    if (poData.deliveryType !== undefined) poUpdateData.deliveryType = poData.deliveryType;

    await poRepository.updatePurchaseOrder(purchaseOrderId, poUpdateData, transaction);

    // Update Freight Detail
    if (poData.freightDetail && Object.keys(poData.freightDetail).length > 0) {
      const existingFd = await poRepository.getFreightDetailByPoId(purchaseOrderId, transaction);
      if (existingFd) {
        await poRepository.updateFreightDetail(purchaseOrderId, poData.freightDetail, transaction);
      } else {
        await poRepository.createFreightDetail(poData.freightDetail, { purchaseOrderId }, transaction);
      }
    }

    // Update Notes
    if (notesData) {
      if (notesData.internal !== undefined) {
        const existingInternal = await notesRepository.findNoteByReference(purchaseOrderId, "purchase_order", "internal", transaction);
        if (existingInternal) {
          if (notesData.internal) {
            await notesRepository.updateNote(existingInternal.id, { description: notesData.internal }, transaction);
          } else {
            await notesRepository.deleteNote(existingInternal.id, transaction);
          }
        } else if (notesData.internal) {
          await notesRepository.createNote(
            {
              description: notesData.internal,
              type: "internal",
              referenceType: "purchase_order",
              referenceId: purchaseOrderId,
            },
            transaction
          );
        }
      }

      if (notesData.printable !== undefined) {
        const existingPrintable = await notesRepository.findNoteByReference(purchaseOrderId, "purchase_order", "printable", transaction);
        if (existingPrintable) {
          if (notesData.printable) {
            await notesRepository.updateNote(existingPrintable.id, { description: notesData.printable }, transaction);
          } else {
            await notesRepository.deleteNote(existingPrintable.id, transaction);
          }
        } else if (notesData.printable) {
          await notesRepository.createNote(
            {
              description: notesData.printable,
              type: "printable",
              referenceType: "purchase_order",
              referenceId: purchaseOrderId,
            },
            transaction
          );
        }
      }
    }

    // Update Requested Purchase Products
    if (poData.products?.length) {
      for (const product of poData.products) {
        const prod = await productRepository.findProductById(product.productId, transaction);
        if (!prod) {
          throw new AppError(`Product with ID ${product.productId} not found`, 404);
        }
        if (prod.isSlabType && (product.noOfSlabs === undefined || product.noOfSlabs === null || product.noOfSlabs <= 0)) {
          throw new AppError(`Number of slabs is required for slab product "${prod.name}"`, 400);
        }
      }

      await requestedPurchaseProductRepository.deleteRequestedProductsByPurchaseOrderId(purchaseOrderId, transaction);
      await poRepository.createRequestedPurchaseProducts(poData.products, purchaseOrderId, transaction);
    }

    await transaction.commit();
    return await poRepository.getPurchaseOrderById(purchaseOrderId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
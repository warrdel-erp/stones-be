import * as poRepository from "../repositories/purchaseOrder.repository";
import { sequelize } from "../config/database";
import * as notesRepository from "../repositories/notes.repository";
import * as requestedPurchaseProductRepository from "../repositories/requestedPurchaseProduct.repository";
import * as siplProductRepository from "../repositories/siplProducts.repository";

/**
 * Service to create a Purchase Order along with internal and printable notes.
 */
export const registerPurchaseOrder = async (poData: any, notesData: any) => {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Create purchase order
    const newPO: any = await poRepository.createPurchaseOrder(poData, transaction);

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

    await transaction.commit(); // Commit transaction
    return { ...newPO.get({ plain: true }), internalNote, printableNote, freightDetail, requestedPurchaseProduct };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

export const getAllPurchaseOrders = async (page: number = 1, limit: number = 10) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  let { rows, count }: { rows: any[]; count: number } = await poRepository.getAllPurchaseOrders(page, limit);

  // Add totalQuantity to each PO
  const poTotalQuantity: any[] = await requestedPurchaseProductRepository.getTotalQuantityForAllPOs();
  const totalSiplProduct: any[] = await siplProductRepository.getTotalQuantityForAllPO();

  rows = rows.map((e) => {
    const plainPo = e.get({ plain: true }); // Convert Sequelize instance to plain object
    return {
      ...plainPo,
      totalQuantity: Number(poTotalQuantity?.find?.((k) => plainPo.id == k.purchaseOrderId)?.totalQuantity || 0),
      totalSiplQuantity: Number(totalSiplProduct?.find?.((k) => plainPo.id == k.purchaseOrderId)?.totalQuantity || 0),
    };
  });

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

  // Fetch total quantity of requested products for this PO
  const totalQuantity = await requestedPurchaseProductRepository.getTotalQuantityByPurchaseOrder(id);
  const totalSiplQuantity = await siplProductRepository.getTotalQuantityByPurchaseOrder(id);

  // const fulfilledBySipl = [];

  // Remove duplicate product ids
  // const productIds = Array.from(
  //   new Set(purchaseOrder.requestedPurchaseProducts.map((product: any) => product.productId))
  // );

  // for (const productId of productIds) {
  // const siplCalc = await siplProductRepository.getTotalQuantityByProductAndPO(Number(productId), id);
  // const requestedProductCalc = await requestedPurchaseProductRepository.getTotalQuantityByPurchaseOrderAndProduct(
  //   id,
  //   Number(productId)
  // );
  // fulfilledBySipl.push({
  //   productId: productId,
  //   siplTotalQuantity: siplCalc,
  //   requestedTotalQuantity: requestedProductCalc,
  // });
  // }

  return {
    ...purchaseOrder,
    totalRequestedQuantity: totalQuantity,
    totalSiplQuantity,
    // fulfilledBySipl,
  };
};

// Get SIPL List for PO.
export const getSIPLsForPurchaseOrder = async (purchaseOrderId: number) => {
  const sipls = await poRepository.getSIPLsByPurchaseOrderId(purchaseOrderId);
  return sipls.length > 0 ? sipls : []; // Ensure an empty array if no SIPLs exist
};

// Get new PO number
export const getPONumber = async () => {
  return await poRepository.getPoNumber();
};

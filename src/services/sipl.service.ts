import { sequelize } from "../config/database";
import * as poRepository from "../repositories/purchaseOrder.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as siplProductsRepository from "../repositories/siplProducts.repository";
import * as requestedPurchaseProductsRepository from "../repositories/requestedPurchaseProduct.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { Transaction } from "sequelize";

/**
 * Processes the inventory reception by updating slab statuses.
 * @param siplId - The SIPL ID.
 */
export const receiveInventory = async (siplId: number): Promise<number> => {
  return await slabRepository.updateSlabStatusBySipl(siplId);
};

// Create SIPL
export async function createSIPLService(siplData: any, transaction?: Transaction) {
  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction(); // Start a transaction
  }

  try {
    // Create SIPL
    let sipl: any = await siplRepository.createSIPL({ ...siplData }, transaction);

    const productsWithSIPLId: any[] = [];

    // Create SIPL Products (if provided)
    if (siplData.products?.length) {
      for (const product of siplData.products) {
        const existingProduct = await requestedPurchaseProductsRepository.findById(
          product.requestedPurchaseProductId,
          transaction
        );

        if (!existingProduct) {
          throw new Error(`Requested Product with ID ${product.requestedPurchaseProductId} not found in given PO.`);
        }

        productsWithSIPLId.push({
          ...product,
          siplId: sipl.id,
        });
      }

      await siplProductsRepository.createBulkSIPLProducts(productsWithSIPLId, transaction);
    }

    // Create Freight Detail (if provided)
    if (siplData.freightDetail) {
      await poRepository.createFreightDetail(siplData.freightDetail, { siplId: sipl.id }, transaction);
    }

    if (shouldCommitTransaction) await transaction.commit();
    return sipl;
  } catch (error: any) {
    if (shouldCommitTransaction) transaction.rollback();
    throw error;
  }
}

// Create slabs for SIPL
export async function handleCreateSlabs(slabData: any) {
  const transaction = await sequelize.transaction();

  try {
    if (!slabData.quantity || slabData.quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    const sipl: any = await siplRepository.findSIPLByIdSimple(slabData.siplId);

    if (!sipl) {
      throw new Error("SIPL not found.");
    }

    // Create a new InventoryProduct for each Slab
    const inventoryProducts: any = await inventoryProductRepository.createInventoryProducts(
      slabData.binId,
      slabData.quantity,
      transaction
    );

    const lastSerialNumber = await slabRepository.getLastSerialNumber(sipl.purchaseOrderId, slabData.siplId);

    // Pair each slab with its own inventory product
    const slabs = inventoryProducts.map((inventoryProduct: any, index: number) => ({
      ...slabData, // Ensure each slab has unique data
      inventoryProductId: inventoryProduct.id,
      purchaseOrderId: sipl.purchaseOrderId,
      serialNumber: lastSerialNumber + index + 1,
      barcode: slabData.barcode ? `${slabData.barcode}-${Math.random().toString(36).substring(7)}` : null,
    }));

    const createdSlabs = await slabRepository.createSlabs(slabs, transaction);

    await transaction.commit();
    return createdSlabs;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
}

// Get new PO number
export const getInvoiceNumber = async () => {
  return await siplRepository.getInvoiceNumber();
};

// get SIPL by ID
export const getSIPLById = async (id: number) => {
  const sipl = await siplRepository.findSIPLById(id);

  if (!sipl) {
    throw new Error("SIPL not found");
  }

  return sipl;
};

// Get all SIPLs
export const getAllSIPLs = async (page: number, limit: number) => {
  const { rows, count } = await siplRepository.getAllSIPLs(page, limit);

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

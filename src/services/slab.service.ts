import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as productRepository from "../repositories/product.repository";
import * as journalEntryService from "../services/journalEntry.service";
import * as models from "../models";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { randomId, isSIPLLocked } from "../helper";
import { scoped } from "../utils/scoped";
import * as genericProductRepository from "../repositories/genericProduct.repository";
import * as inventoryProductService from "./inventoryProduct.service";
import {
  decimalAdd,
  decimalDivide,
  decimalGreaterThan,
  decimalMultiply,
} from "../helper/decimal";

export async function getSlabLogsBySlabIdService(slabId: number) {
  return await slabRepository.findByIdWithLogs(slabId);
}

// Get all slabs.
export const fetchAllSlabs = async (filters?: any, transaction?: Transaction, locationId?: number) => {
  return await slabRepository.getAllSlabs(filters, transaction, locationId);
};

// Get only split slabs.
export const fetchSplitSlabs = async (transaction?: Transaction, locationId?: number) => {
  return await slabRepository.getSplitSlabs(transaction, locationId);
};

// Update slab
export const updateSlab = async (slabId: number, updateData: any) => {
  const sipl = await siplRepository.findSIPLBySlabId(slabId);

  if (isSIPLLocked(sipl)) {
    throw new AppError("Slab cannot be updated as the SIPL is locked (received or canceled)", 400);
  }

  return await slabRepository.updateSlabById(slabId, updateData);
};

// Bulk update slabs
export const bulkUpdateSlabs = async (slabsData: Array<{ id: number;[key: string]: any }>) => {
  if (!slabsData || slabsData.length === 0) return 0;

  const transaction = await sequelize.transaction(); // Explicitly start transaction
  let affectedRows = 0;

  try {
    for (const slabData of slabsData) {
      const { id, binId, ...updateFields } = slabData;

      if (!id) {
        throw new AppError("id is mandatory to all slabs to update.", 400);
      }

      // If binId is provided, update the corresponding inventory product
      if (binId !== undefined) {
        const slab: any = await models.Slab.findByPk(id, {
          attributes: ['inventoryProductId'],
          transaction
        });
        if (!slab) {
          throw new AppError(`Slab with id ${id} not found`, 404);
        }

        if (!slab.inventoryProductId) {
          throw new AppError(`Slab with id ${id} does not have an associated inventory product`, 400);
        }
        const inventryProductData: any = await models.InventoryProduct.findByPk(slab.inventoryProductId, { attributes: ['siplId'], transaction })

        const sipl: any = await models.SIPL.findByPk(inventryProductData.dataValues.siplId, {
          attributes: ['inventoryReceived', 'status'],
          transaction
        })

        if (isSIPLLocked(sipl)) {
          throw new AppError(`Slab with this ${id} Slab is already received or canceled.`, 400);
        }
        // Update the inventory product's binId
        const [updatedInventoryProduct] = await scoped(models.InventoryProduct).update(
          { binId },
          {
            where: { id: slab.inventoryProductId },
            transaction
          }
        );
        affectedRows += updatedInventoryProduct
      }

      // Update slab fields (excluding binId)
      const [updatedCount] = await slabRepository.updateSlabById(id, updateFields, transaction);

      affectedRows += (updatedCount);
    }

    await transaction.commit(); // Commit transaction if everything succeeds
    return affectedRows;
  } catch (error) {
    await transaction.rollback(); // Rollback transaction on error
    throw error; // Ensure the error is propagated
  }
};

/**
 * Check if all slabs in a SIPL are fully filled
 * A slab is fully filled if it has: block, bundle, receivingLength, receivingWidth, and binId in its inventory product
 * If no slabs are present and only generic products exist, it is considered as success
 */
export const checkSiplSlabsFullyFilled = async (siplId: number) => {
  // Fetch slabs with inventory products from repository
  const slabs = await slabRepository.getSlabsWithInventoryProductBySiplId(siplId);

  // Handle case when no slabs found
  if (slabs.length === 0) {
    // Check if there are generic products for this SIPL
    const genericProducts = await scoped(models.GenericProduct).findAll({
      where: { siplId },
      attributes: ['id']
    });

    // If generic products exist, consider it as success
    if (genericProducts.length > 0) {
      return {
        allFilled: true,
        totalSlabs: 0,
        filledSlabs: 0,
        unfilledSlabs: 0,
        unfilledSlabIds: [],
        message: 'No slabs found for this SIPL, but generic products are present. Ready for inventory reception.'
      };
    }

    // No slabs and no generic products
    return {
      allFilled: false,
      totalSlabs: 0,
      filledSlabs: 0,
      unfilledSlabs: 0,
      unfilledSlabIds: [],
      message: 'No slabs or generic products found for this SIPL'
    };
  }

  // Process slabs and check if they are fully filled
  let filledCount = 0;
  const unfilledSlabIds: number[] = [];

  slabs.forEach((slab: any) => {
    const slabData = slab.get({ plain: true });
    const inventoryProduct = slabData.inventoryProduct;

    // Check if all required fields are filled
    const isFilled =
      slabData.block !== null && slabData.block !== undefined &&
      slabData.lot !== null && slabData.lot !== undefined &&
      slabData.receivingLength !== null && slabData.receivingLength !== undefined &&
      slabData.receivingWidth !== null && slabData.receivingWidth !== undefined
      // && inventoryProduct?.binId !== null && inventoryProduct?.binId !== undefined
      ;

    if (isFilled) {
      filledCount++;
    } else {
      unfilledSlabIds.push(slabData.id);
    }
  });

  // Return result with statistics
  return {
    allFilled: filledCount === slabs.length,
    totalSlabs: slabs.length,
    filledSlabs: filledCount,
    unfilledSlabs: slabs.length - filledCount,
    unfilledSlabIds,
    message: filledCount === slabs.length
      ? 'All slabs are fully filled'
      : `${slabs.length - filledCount} slab(s) are not fully filled`
  };
};

/**
 * Split a slab into multiple pieces
 * Only IN_INVENTORY InventoryProduct can be split
 * Marks the original slab and InventoryProduct as isBroken
 * Creates new slabs with new barcode, serialNumber, slabNumber, and parentSlabId
 * Creates corresponding InventoryProducts for the new slabs
 * @param slabId - ID of the slab to split
 * @param slabsData - Array of objects containing receivingLength, receivingWidth, and slabNumber for each new piece (validated by middleware)
 * @param userId - ID of the user performing the split
 * @param clientId - ID of the client (for authorization check)
 */
export const splitSlab = async (slabId: number, slabsData: Array<{ receivingLength: number; receivingWidth: number; slabNumber?: number }>, userId?: number, clientId?: number) => {
  const pieces = slabsData.length;

  const transaction = await sequelize.transaction();

  try {
    // Get the original slab with its inventory product
    const originalSlab: any = await models.Slab.findByPk(slabId, {
      include: [
        {
          association: "inventoryProduct",
          required: true,
        },
        {
          association: "sipl",
          attributes: ["id", "purchaseOrderId"],
        },
      ],
      transaction,
    });

    if (!originalSlab) {
      throw new AppError("Slab not found", 404);
    }

    // Validate that the slab belongs to the correct client
    if (clientId && originalSlab.clientId !== clientId) {
      throw new AppError("Slab does not belong to your client", 403);
    }

    const inventoryProduct = originalSlab.inventoryProduct;

    // Validate total area of split slabs
    validateSplitSlabs(originalSlab, slabsData)

    if (!inventoryProduct) {
      throw new AppError("Slab does not have an associated inventory product", 400);
    }


    // Check if the inventory product status is IN_INVENTORY
    if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
      throw new AppError(
        `Only IN_INVENTORY inventory products can be split. Current status: ${inventoryProduct.status}`,
        400
      );
    }

    // Check if the slab is already broken
    if (originalSlab.isBroken) {
      throw new AppError("This slab is already marked as broken", 400);
    }

    await inventoryProductService.checkTiedToPublishedQuotation(inventoryProduct.id, transaction);

    // Mark the original slab and inventory product as broken
    await scoped(models.Slab).update(
      { isBroken: true, updatedBy: userId },
      { where: { id: slabId }, transaction }
    );

    await scoped(models.InventoryProduct).update(
      { status: INVENTORY_ITEM_STATUS.BROKEN },
      { where: { id: inventoryProduct.id }, transaction }
    );

    // Get the SIPL to get purchaseOrderId if available
    const sipl = originalSlab.sipl;
    const purchaseOrderId = sipl ? sipl.purchaseOrderId : null;
    const siplId = originalSlab.siplId || null;

    // Get selling price from product
    const product: any = await productRepository.getProductByIdSimple(originalSlab.productId);
    const sellingPrice = product?.singleUnitPrice;

    // Construct base combined number hierarchically
    const baseCombinedNumber = inventoryProduct.combinedNumber || "";

    // Create new InventoryProducts for the split pieces with IN_INVENTORY status and landedUnitCost
    const newInventoryProductsData = Array.from({ length: pieces }, (_, index) => ({
      binId: inventoryProduct.binId,
      combinedNumber: `${baseCombinedNumber}-${index + 1}`,
      isSlabType: true,
      sellingPrice,
      siplId,
      productId: originalSlab.productId,
      clientId: originalSlab.clientId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      landedUnitCost: inventoryProduct.landedUnitCost,
      receivedDate: inventoryProduct.receivedDate,
      FOBcost: inventoryProduct.FOBcost,
    }));

    const newInventoryProducts = await scoped(models.InventoryProduct).bulkCreate(
      newInventoryProductsData,
      { transaction }
    );

    // Get the last serial number for the SIPL
    const lastSerialNumber = await slabRepository.getLastSerialNumber(purchaseOrderId, siplId);

    // Automatically get the last slab number to increment sequentially
    const lastSlabNumber = await slabRepository.getLastSlabNumber(originalSlab.productId, siplId);

    // Create new slabs for each piece
    const newSlabs = newInventoryProducts.map((invProd: any, index: number) => ({
      serialNumber: lastSerialNumber + index + 1,
      slabNumber: lastSlabNumber + index + 1,
      barcode: randomId().toUpperCase(),
      entryUnit: originalSlab.entryUnit,
      packageLength: slabsData[index].receivingLength, // Packaging data should go into package length & width
      packageWidth: slabsData[index].receivingWidth,
      receivingLength: slabsData[index].receivingLength,
      receivingWidth: slabsData[index].receivingWidth,
      block: originalSlab.block,
      lot: originalSlab.lot,
      notes: originalSlab.notes,
      status: originalSlab.status,
      inventoryProductId: invProd.id,
      purchaseOrderId,
      siplId,
      siplProductId: originalSlab.siplProductId || null,
      productId: originalSlab.productId,
      clientId: originalSlab.clientId,
      parentSlabId: slabId,
      createdBy: userId,
      updatedBy: userId,
      isBroken: false,
    }));

    const createdSlabs = await slabRepository.createSlabs(newSlabs, transaction);

    // Update assetValue for each new split inventory product proportionally
    const originalArea = decimalDivide(decimalMultiply(originalSlab.receivingLength, originalSlab.receivingWidth), 144);
    const originalAssetValue = Number(inventoryProduct.assetValue) || 0;

    for (let i = 0; i < newInventoryProducts.length; i++) {
      const invProd = newInventoryProducts[i];
      const slabData = slabsData[i];
      const area = decimalDivide(decimalMultiply(slabData.receivingLength, slabData.receivingWidth), 144);
      
      let assetValue = 0;
      if (originalArea > 0) {
        assetValue = decimalDivide(decimalMultiply(area, originalAssetValue), originalArea);
      }

      invProd.assetValue = assetValue;
      if (invProd.dataValues) {
        invProd.dataValues.assetValue = assetValue;
      }

      await scoped(models.InventoryProduct).update(
        { assetValue },
        { where: { id: invProd.id }, transaction }
      );

      createdSlabs[i].inventoryProduct = invProd;
      if (createdSlabs[i].dataValues) {
        createdSlabs[i].dataValues.inventoryProduct = invProd;
      }
    }

    // Create journal entries for slab split (CR for original, DR for new slabs)
    await journalEntryService.createJournalEntriesForSlabSplit(
      originalSlab,
      inventoryProduct,
      createdSlabs,
      originalSlab.siplId,
      originalSlab.clientId,
      transaction
    );

    await transaction.commit();

    return {
      originalSlab: {
        id: originalSlab.id,
        isBroken: true,
      },
      newSlabs: createdSlabs,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get split history for a slab
 * Returns the child slab and all its parents (from immediate parent to root)
 */
export const getSlabSplitHistory = async (slabId: number, clientId?: number) => {
  // First verify the slab exists and belongs to the client
  const slab: any = await models.Slab.findByPk(slabId, {
    include: [
      {
        association: "inventoryProduct",
      },
    ],
  });

  if (!slab) {
    throw new AppError("Slab not found", 404);
  }

  // Validate that the slab belongs to the correct client
  if (clientId && slab.clientId !== clientId) {
    throw new AppError("Slab does not belong to your client", 403);
  }

  const history = await slabRepository.getSlabSplitHistory(slabId);

  if (!history) {
    throw new AppError("Could not retrieve split history", 500);
  }

  return history;
};


function validateSplitSlabs(originalSlab: any, slabsData: Array<{ receivingLength: number; receivingWidth: number }>) {

  const originalArea = decimalDivide(
    decimalMultiply(originalSlab.receivingLength, originalSlab.receivingWidth),
    144
  );

  let runningArea = 0;
  let currentLength = 0;
  let currentWidth = 0;

  for (const slab of slabsData) {

    const area = decimalDivide(
      decimalMultiply(slab.receivingLength, slab.receivingWidth),
      144
    );

    runningArea = decimalAdd(runningArea, area);

    currentLength = decimalAdd(currentLength, slab.receivingLength);
    if (decimalGreaterThan(currentLength, originalSlab.receivingLength)) {
      throw new AppError(
        `Total slab length cannot exceed ${originalSlab.receivingLength}`,
        400
      );
    }

    currentWidth = decimalAdd(currentWidth, slab.receivingWidth);

    if (decimalGreaterThan(currentWidth, originalSlab.receivingWidth)) {
      throw new AppError(
        `Total slab width cannot exceed ${originalSlab.receivingWidth}`,
        400
      );
    }

    if (decimalGreaterThan(runningArea, originalArea)) {
      throw new AppError(
        "Total split slab area cannot exceed original slab area",
        400
      );
    }

  }

}

export const deleteSlab = async (slabId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const slab: any = await models.Slab.findByPk(slabId, {
      include: [
        { model: models.SIPL, as: 'sipl' },
        { model: models.InventoryProduct, as: 'inventoryProduct' }
      ],
      transaction
    });

    if (!slab) {
      throw new AppError("Slab not found", 404);
    }

    if (isSIPLLocked(slab.sipl)) {
      throw new AppError("Slab cannot be deleted as the SIPL is locked (received or canceled)", 400);
    }

    const { inventoryProductId, siplId } = slab;

    if (inventoryProductId) {
      const newerInvProd = await scoped(models.InventoryProduct).findOne({
        where: {
          siplId,
          id: { [Op.gt]: inventoryProductId }
        },
        transaction
      });

      if (newerInvProd) {
        throw new AppError("Only the last created inventory product for this SIPL can be deleted", 400);
      }

      await inventoryProductService.checkTiedToPublishedQuotation(inventoryProductId, transaction);

      await models.InventoryProductImage.destroy({
        where: { inventoryProductId },
        transaction
      });
    }

    await scoped(models.SlabRemeasurement).destroy({
      where: { slabId },
      transaction
    });

    await scoped(models.Slab).destroy({
      where: { id: slabId },
      transaction
    });

    if (inventoryProductId) {
      await scoped(models.InventoryProduct).destroy({
        where: { id: inventoryProductId },
        transaction
      });
    }

    await transaction.commit();
    return { success: true, message: "Slab deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as models from "../models";

export async function getSlabLogsBySlabIdService(slabId: number) {
  return await slabRepository.findByIdWithLogs(slabId);
}

// Get all slabs.
export const fetchAllSlabs = async (filters?: any, transaction?: Transaction, locationId?: number) => {
  return await slabRepository.getAllSlabs(filters, transaction, locationId);
};

// Update slab
export const updateSlab = async (slabId: number, updateData: any) => {
  const sipl = await siplRepository.findSIPLBySlabId(slabId);

  if (sipl.inventoryReceived) {
    throw new AppError("Slab cannot be updated as inventory is received", 400);
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

        // Update the inventory product's binId
        const [updatedInventoryProduct] = await models.InventoryProduct.update(
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
 */
export const checkSiplSlabsFullyFilled = async (siplId: number) => {
  // Fetch slabs with inventory products from repository
  const slabs = await slabRepository.getSlabsWithInventoryProductBySiplId(siplId);

  // Handle case when no slabs found
  if (slabs.length === 0) {
    return {
      allFilled: false,
      totalSlabs: 0,
      filledSlabs: 0,
      unfilledSlabs: 0,
      unfilledSlabIds: [],
      message: 'No slabs found for this SIPL'
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
      slabData.receivingWidth !== null && slabData.receivingWidth !== undefined &&
      inventoryProduct?.binId !== null && inventoryProduct?.binId !== undefined;

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

import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";



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
      const { id, ...updateFields } = slabData;

      if (!id) {
        throw new AppError("id is mandatory to all slabs to update.", 400);
      }

      const [updatedCount] = await slabRepository.updateSlabById(id, updateFields, transaction);

      affectedRows += updatedCount;
    }

    await transaction.commit(); // Commit transaction if everything succeeds
    return affectedRows;
  } catch (error) {
    await transaction.rollback(); // Rollback transaction on error
    throw error; // Ensure the error is propagated
  }
};

import Slab from "../models/slab";
import { SLAB_STATUS } from "../constants";
import { Transaction } from "sequelize";
import * as models from "../models";

/**
 * Finds all slabs by SIPL ID and updates their status.
 * @param siplId - The SIPL ID whose slabs should be updated.
 * @returns Number of updated records.
 */
export const updateSlabStatusBySipl = async (siplId: number): Promise<number> => {
  const [updatedCount] = await Slab.update(
    { status: SLAB_STATUS.IN_INVENTORY },
    { where: { siplId, status: SLAB_STATUS.INITIATE } } // Only update slabs that are in transit
  );

  return updatedCount;
};

// Create slabs
export async function createSlabs(slabData: any, transaction?: Transaction) {
  const { quantity, ...slabDetails } = slabData;

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const slabs = Array.from({ length: quantity }).map(() => ({
    ...slabDetails,
    serialNumber: `${slabDetails.serialNumber}-${Math.random().toString(36).substring(7)}`, // Ensuring uniqueness
    barcode: slabDetails.barcode ? `${slabDetails.barcode}-${Math.random().toString(36).substring(7)}` : null,
  }));

  return await models.Slab.bulkCreate(slabs, { transaction });
}

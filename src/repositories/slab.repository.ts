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
export const createSlabs = async (slabData: any, transaction?: Transaction) => {
  return await models.Slab.bulkCreate(slabData, { transaction });
};

// update hold status of slab
export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  return await Slab.update({ isHold }, { where: { id: slabId } });
};

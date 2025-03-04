import Slab from "../models/slab";
import { SLAB_STATUS } from "../constants";
import { Transaction } from "sequelize";
import * as models from "../models";

// Finds all slabs by SIPL ID and updates their status.
export const updateSlabStatusBySipl = async (siplId: number): Promise<number> => {
  const [updatedCount] = await Slab.update(
    { status: SLAB_STATUS.IN_INVENTORY },
    { where: { siplId, status: SLAB_STATUS.INITIATE } } // Only update slabs that are initiated
  );

  return updatedCount;
};

// Create slabs
export const createSlabs = async (slabData: any, transaction?: Transaction) => {
  return await models.Slab.bulkCreate(slabData, { transaction });
};

// Create slabs
export const getSlabByInventoryProductId = async (inventoryProductId: number, transaction?: Transaction) => {
  return await models.Slab.findOne({ where: { inventoryProductId }, transaction });
};

// update hold status of slab
export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  return await Slab.update({ isHold }, { where: { id: slabId } });
};

// Update the status of a Slab based on inventoryProductId.
export const updateSlabStatusByInventoryProduct = async (
  inventoryProductId: number,
  status: (typeof SLAB_STATUS)[keyof typeof SLAB_STATUS],
  transaction?: Transaction
) => {
  // Find the related slab
  const slab = await Slab.findOne({
    where: { inventoryProductId },
    transaction,
  });

  if (!slab) {
    return null; // No slab found for this inventoryProductId
  }

  // Update the status
  await Slab.update({ status }, { where: { inventoryProductId } });

  return slab;
};

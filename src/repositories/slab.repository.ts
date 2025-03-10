import Slab from "../models/slab";
import { SLAB_STATUS } from "../constants";
import { Transaction } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";

// Finds all slabs by SIPL ID and updates their status.
export const updateSlabStatusBySipl = async (siplId: number, transaction: Transaction): Promise<number> => {
  const [updatedCount] = await Slab.update(
    { status: SLAB_STATUS.IN_INVENTORY },
    { where: { siplId, status: SLAB_STATUS.INITIATE }, individualHooks: true, transaction } // Only update slabs that are initiated
  );

  return updatedCount;
};

// Create slabs
export const createSlabs = async (slabData: any, transaction?: Transaction) => {
  return await models.Slab.bulkCreate(slabData, { transaction, individualHooks: true });
};

export const getLastSerialNumber = async (purchaseOrderId: number, siplId: number) => {
  const existingSlab: any = await Slab.findOne({
    where: { siplId: siplId, purchaseOrderId: purchaseOrderId },
    order: [["serialNumber", "DESC"]],
    attributes: ["serialNumber"],
  });

  return existingSlab ? existingSlab.serialNumber : 0;
};

// Create slabs
export const getSlabByInventoryProductId = async (inventoryProductId: number, transaction?: Transaction) => {
  return await models.Slab.findOne({ where: { inventoryProductId }, transaction });
};

// update hold status of slab
export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  return await Slab.update({ isHold }, { where: { id: slabId }, individualHooks: true });
};

// update hold status of slab
export const updateSlabCartStatus = async (slabId: number, isInCart: boolean) => {
  return await Slab.update({ isInCart }, { where: { id: slabId }, individualHooks: true });
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
  await Slab.update({ status }, { where: { inventoryProductId }, individualHooks: true, transaction });

  return slab;
};

// Find by id
export const findByIdSimple = async (slabId: number) => {
  const slab = await models.Slab.findByPk(slabId);
  return slab?.get({ plain: true });
};

// Find by id
export const findByIdWithLogs = async (slabId: number) => {
  const slab = await models.Slab.findByPk(slabId, {
    include: [
      {
        model: models.SlabRemeasurement,
        as: "remeasurements",
      },
    ],
  });
  return slab?.get({ plain: true });
};

export const getTotalAreaBySIPL = async (siplId: number) => {
  return await models.Slab.findAll({
    attributes: ["siplId", [sequelize.fn("SUM", sequelize.literal("receivingLength * receivingWidth")), "totalArea"]],
    where: {
      siplId: siplId, // Filter slabs by the given SIPL IDs
    },
    group: ["siplId"],
    raw: true,
  });
};

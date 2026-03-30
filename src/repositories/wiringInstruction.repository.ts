import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Create a new wiring instruction
 */
export const createWiringInstruction = async (data: any, transaction?: Transaction) => {
  return await scoped(models.WiringInstruction).create(data, { transaction });
};

/**
 * Update wiring instruction by ID
 */
export const updateWiringInstruction = async (id: number, data: any, transaction?: Transaction) => {
  return await scoped(models.WiringInstruction).update(data, {
    where: { id },
    transaction,
  });
};

/**
 * Delete wiring instruction by ID
 */
export const deleteWiringInstruction = async (id: number, transaction?: Transaction) => {
  return await scoped(models.WiringInstruction).destroy({
    where: { id },
    transaction,
  });
};

/**
 * Get all wiring instructions with pagination and filters
 */
export const getAllWiringInstructions = async (page: number, limit: number, filter?: WhereOptions) => {
  const offset = (page - 1) * limit;

  const { rows: data, count: total } = await scoped(models.WiringInstruction).findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

/**
 * Find wiring instruction by ID
 */
export const findWiringInstructionById = async (id: number) => {
  return await scoped(models.WiringInstruction).findOne({
    where: { id },
  });
};

/**
 * Find all wiring instructions for a specific vendor
 */
export const findWiringInstructionsByVendorId = async (vendorId: number) => {
  return await scoped(models.WiringInstruction).findAll({
    where: { vendorId },
    order: [["createdAt", "DESC"]],
  });
};

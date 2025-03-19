import { WhereOptions } from "sequelize";
import * as slabRepository from "../repositories/slab.repository";

export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  await slabRepository.updateSlabHoldStatus(slabId, isHold);
  return { message: `Slab ID ${slabId} hold status updated to ${isHold}` };
};

export const updateSlabCartStatus = async (slabId: number, isInCart: boolean) => {
  await slabRepository.updateSlabCartStatus(slabId, isInCart);
  return { message: `Slab ID ${slabId} cart status updated to ${isInCart}` };
};

export async function getSlabLogsBySlabIdService(slabId: number) {
  return await slabRepository.findByIdWithLogs(slabId);
}

// Get all slabs.
export const fetchAllSlabs = async (filters?: WhereOptions) => {
  return await slabRepository.getAllSlabs(filters);
};

import { WhereOptions } from "sequelize";
import * as slabRepository from "../repositories/slab.repository";
import * as siplRepository from "../repositories/sipl.repository";
import { AppError } from "../helper/appError";

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

// Update slab
export const updateSlab = async (slabId: number, updateData: any) => {
  const sipl = await siplRepository.findSIPLBySlabId(slabId);

  if (sipl.inventoryReceived) {
    throw new AppError("Slab cannot be updated as inventory is received", 400);
  }

  return await slabRepository.updateSlabById(slabId, updateData);
};

import * as slabRepository from "../repositories/slab.repository";

export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  await slabRepository.updateSlabHoldStatus(slabId, isHold);
  return { message: `Slab ID ${slabId} hold status updated to ${isHold}` };
};

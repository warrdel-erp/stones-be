import * as slabRemeasurementRepository from "../repositories/slabRemeasurement.repository";
import * as slabRepository from "../repositories/slab.repository";
import { AppError } from "../helper/appError";
import { SLAB_STATUS } from "../constants";

export async function createSlabLogService(slabLogData: any) {
  const slab = await slabRepository.findByIdSimple(slabLogData.siplId);

  if (!slab) {
    throw new AppError("Slab not found", 400);
  }

  if (slab.status == SLAB_STATUS.IN_INVENTORY) {
    return await slabRemeasurementRepository.createSlabLog(slabLogData);
  } else {
    throw new AppError(`Slab is not in inventory it's status is ${slab.status}`, 400);
  }
}

import * as models from "../models";
import { scoped } from "../utils/scoped";

export async function createSlabLog(slabLogData: any, transaction?: any) {
  return await scoped(models.SlabRemeasurement).create(slabLogData, { transaction });
}

export async function getSlabLogsBySlabId(slabId: number) {
  return await scoped(models.SlabRemeasurement).findAll({
    where: { slabId },
    order: [["createdAt", "DESC"]],
  });
}

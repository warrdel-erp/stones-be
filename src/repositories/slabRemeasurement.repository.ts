import * as models from "../models";

export async function createSlabLog(slabLogData: any, transaction?: any) {
  return await models.SlabRemeasurement.create(slabLogData, { transaction });
}

export async function getSlabLogsBySlabId(slabId: number) {
  return await models.SlabRemeasurement.findAll({
    where: { slabId },
    order: [["createdAt", "DESC"]],
  });
}

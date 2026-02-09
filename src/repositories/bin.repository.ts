import * as models from "../models";
import { scoped } from "../utils/scoped";

export async function findBinsByLocation(locationId: number) {
  return await scoped(models.Bin).findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: models.Warehouse,
        where: { locationId }, // Filter warehouses by locationId
        attributes: [],
      },
    ],
  });
}

export const createBin = async (payload: any) => {
  return await scoped(models.Bin).create(payload);
};

export const getAllBins = async () => {
  return await scoped(models.Bin).findAll({
    include: [
      {
        model: models.Warehouse,
        attributes: ["id", "locationId"],
      },
    ],
  });
};

export const getBinById = async (id: number) => {
  return await scoped(models.Bin).findOne({
    where: { id },
    include: [
      {
        model: models.Warehouse,
        attributes: ["id", "locationId"],
      },
    ],
  });
};

export const updateBin = async (id: number, data: any) => {
  return await scoped(models.Bin).update(data, { where: { id } });
};

export const deleteBin = async (id: number) => {
  const bin = await scoped(models.Bin).findOne({
    where: { id },
  });

  if (bin) {
    return await scoped(models.Bin).destroy({ where: { id } });
  }

  return 0;
};

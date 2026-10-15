import * as models from "../models";
import { scoped } from "../utils/scoped";
import { sequelize } from "../config/database";

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
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM inventory_products AS ip
            WHERE ip.binId = bins.id AND ip.isSlabType = true
          )`),
          "slabCount",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM inventory_products AS ip
            WHERE ip.binId = bins.id AND ip.isSlabType = false
          )`),
          "genericCount",
        ],
      ],
    },
    include: [
      {
        model: models.Warehouse,
        attributes: ["id", "locationId"],
      },
      {
        model: models.Area,
        as: "area",
        attributes: ["id", "name"],
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
      {
        model: models.Area,
        as: "area",
        attributes: ["id", "name"],
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

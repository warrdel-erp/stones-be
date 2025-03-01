import * as models from "../models";

export async function findBinsByLocation(locationId: number) {
  return await models.Bin.findAll({
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

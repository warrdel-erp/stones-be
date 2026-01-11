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

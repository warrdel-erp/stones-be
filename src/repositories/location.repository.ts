import * as models from "../models";
import { Op, Transaction, fn, col } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { scoped } from "../utils/scoped";

// Create a new location
export const createLocation = async (locationData: any, transaction?: Transaction) => {
  return await scoped(models.Location).create(locationData, { transaction });
};

// Get location options for dropdowns/selects
export const getLocationOptions = async (clientId: number, status?: string) => {
  return scoped(models.Location).findAll({
    attributes: [
      ["locationName", "label"],
      ["id", "value"],
    ],
    where: {
      clientId,
      ...(status ? { status } : {}),
    },
    order: [["locationName", "ASC"]],
  });
};

// Get location by id
export const getLocationById = async (id: number, clientId?: number) => {
  const whereCondition: any = { id };

  if (clientId) {
    whereCondition.clientId = clientId;
  }

  return await scoped(models.Location).findOne({
    where: whereCondition,
  });
};

// Update location by id
export const updateLocation = async (id: number, locationData: any, clientId?: number, transaction?: Transaction) => {
  const whereCondition: any = { id };

  if (clientId) {
    whereCondition.clientId = clientId;
  }

  return await scoped(models.Location).update(locationData, {
    where: whereCondition,
    transaction,
  });
};



// Count on-hand slabs and generic products grouped by location
export const getInventoryCountsByLocation = async (locationIds: number[]) => {
  if (!locationIds.length) return { slabs: [], genericProducts: [] };

  const options = {
    attributes: ["locationId", [fn("COUNT", col("id")), "count"]],
    where: {
      locationId: { [Op.in]: locationIds },
      status: {
        [Op.notIn]: [
          INVENTORY_ITEM_STATUS.INITIATE,
          INVENTORY_ITEM_STATUS.SOLD,
          INVENTORY_ITEM_STATUS.BROKEN,
          INVENTORY_ITEM_STATUS.CANCELED,
        ],
      },
    },
    group: ["locationId"],
    raw: true,
  };

  const [slabs, genericProducts] = await Promise.all([
    scoped(models.Slab).findAll(options),
    scoped(models.GenericProduct).findAll(options),
  ]);

  return { slabs, genericProducts };
};

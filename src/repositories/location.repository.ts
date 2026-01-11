import * as models from "../models";
import { scoped } from "../utils/scoped";

// Create a new location
export const createLocation = async (locationData: any) => {
  return await scoped(models.Location).create(locationData);
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


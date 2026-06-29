import { AppError } from "../helper/appError";
import * as locationRepository from "../repositories/location.repository";
import * as warehouseRepository from "../repositories/warehouse.repository";
import { sequelize } from "../config/database";
import { requestContext } from "../utils/requestContext";

export const createLocation = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    const location = await locationRepository.createLocation(data, transaction);

    // Set locationId in context for subsequent operations (like warehouse creation)
    const store = requestContext.getStore();
    if (store) {
      store.locationId = location.id;
    }

    // Create warehouse for this location
    await warehouseRepository.createWarehouse({
      locationId: location.id,
      clientId: data.clientId
    }, transaction);

    await transaction.commit();
    return location.get({ plain: true });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getLocationById = async (id: number, clientId?: number) => {
  const location = await locationRepository.getLocationById(id, clientId);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return location.get({ plain: true });
};

export const updateLocation = async (id: number, data: any, clientId?: number) => {
  const location = await locationRepository.getLocationById(id, clientId);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  await locationRepository.updateLocation(id, data, clientId);

  const updatedLocation = await locationRepository.getLocationById(id, clientId);
  return updatedLocation!.get({ plain: true });
};



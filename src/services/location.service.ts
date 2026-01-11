import { AppError } from "../helper/appError";
import * as locationRepository from "../repositories/location.repository";

export const createLocation = async (data: any) => {
  const location = await locationRepository.createLocation(data);
  return location.get({ plain: true });
};

export const getLocationById = async (id: number, clientId?: number) => {
  const location = await locationRepository.getLocationById(id, clientId);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return location.get({ plain: true });
};


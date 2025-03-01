import * as binRepository from "../repositories/bin.repository";
import * as models from "../models";
import { AppError } from "../helper/appError";

export async function getBinsByLocation(locationId: number) {
  // Check if location exists
  const location = await models.Location.findByPk(locationId);
  if (!location) {
    throw new AppError("Location not found", 400);
  }

  // Fetch bins from the repository
  return await binRepository.findBinsByLocation(locationId);
}

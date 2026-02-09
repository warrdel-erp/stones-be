import * as binRepository from "../repositories/bin.repository";
import * as models from "../models";
import { AppError } from "../helper/appError";
import { requestContext } from "../utils/requestContext";

export async function getBinsByLocation(locationId: number) {
  // Check if location exists
  const location = await models.Location.findByPk(locationId);

  if (!location) {
    throw new AppError("Location not found", 400);
  }

  // Fetch bins from the repository
  return await binRepository.findBinsByLocation(locationId);
}

export async function create(payload: any, defaultLocationId: number) {
  const { name } = payload;

  if (!name) {
    throw new AppError("Name is required", 400);
  }

  const warehouse = await models.Warehouse.findOne({
    where: { locationId: defaultLocationId },
  });
  if (!warehouse) {
    throw new AppError("Warehouse not found for default location", 404);
  }

  const warehouseData = warehouse.get({ plain: true });
  const enrichedPayload = {
    name,
    warehouseId: warehouseData.id,
  };

  return await binRepository.createBin(enrichedPayload);
}

export async function getAll() {
  return await binRepository.getAllBins();
}

export async function getOne(id: number) {
  const bin = await binRepository.getBinById(id);
  if (!bin) {
    throw new AppError("Bin not found", 404);
  }
  return bin;
}

export async function update(id: number, data: any) {
  const bin = await binRepository.getBinById(id);
  if (!bin) {
    throw new AppError("Bin not found", 404);
  }
  await binRepository.updateBin(id, data);
  return await binRepository.getBinById(id);
}

export async function remove(id: number) {
  const bin = await binRepository.getBinById(id);
  if (!bin) {
    throw new AppError("Bin not found", 404);
  }
  try {
    return await binRepository.deleteBin(id);
  } catch (error) {
    throw new AppError("Bin can not be deleted", 400)
  }

}

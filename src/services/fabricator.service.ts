import * as fabricatorRepository from "../repositories/fabricator.repository";
import { AppError } from "../helper/appError";

export const getProductsSoldToFabricator = async (fabricatorId: number) => {
  const fabricator = await fabricatorRepository.findFabricatorById(fabricatorId);

  if (!fabricator) {
    throw new AppError("Fabricator not found or customer is not a fabricator.", 404);
  }

  return await fabricatorRepository.getProductsSoldToFabricator(fabricatorId);
};
export const getInventoryProductsSoldToFabricator = async (fabricatorId: number, productId: number) => {
  const fabricator = await fabricatorRepository.findFabricatorById(fabricatorId);

  if (!fabricator) {
    throw new AppError("Fabricator not found or customer is not a fabricator.", 404);
  }

  return await fabricatorRepository.getInventoryProductsSoldToFabricator(fabricatorId, productId);
};

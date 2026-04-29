import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as fabricatorService from "../services/fabricator.service";

/**
 * Get list of products sold to a specific fabricator
 */
export const getProductsSoldToFabricator = catchAsync(async (req: AuthRequest, res: Response) => {
  const { fabricatorId } = req.params;

  if (!fabricatorId) {
    return res.status(400).json({ error: "fabricatorId is required" });
  }

  const products = await fabricatorService.getProductsSoldToFabricator(Number(fabricatorId));

  return SuccessResponse(res, 200, "Products sold to fabricator fetched successfully", products);
});
/**
 * Get list of inventory products for a given product and fabricator sold to it
 */
export const getInventoryProductsSoldToFabricator = catchAsync(async (req: AuthRequest, res: Response) => {
  const { fabricatorId, productId } = req.params;

  if (!fabricatorId || !productId) {
    return res.status(400).json({ error: "fabricatorId and productId are required" });
  }

  const inventoryProducts = await fabricatorService.getInventoryProductsSoldToFabricator(
    Number(fabricatorId),
    Number(productId)
  );

  return SuccessResponse(res, 200, "Inventory products sold to fabricator fetched successfully", inventoryProducts);
});

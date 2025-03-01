import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryRepository from "../services/inventory.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getProductsByLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { locationId } = req.params;
  const userId = req.user?.id;

  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  // Check if user has access to this location.
  checkUserLocationAccess(Number(locationId), userId!);

  // Get inventory data
  const products = await inventoryRepository.fetchProductsWithSlabsByLocation(Number(locationId));

  if (!products.length) {
    return res.status(404).json({ message: "No products found for this location" });
  }

  SuccessResponse(res, 200, "Inventory data fetched successfully", products);
});

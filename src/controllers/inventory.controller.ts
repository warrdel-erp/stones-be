import { Request, Response } from "express";
import * as inventoryRepository from "../services/inventory.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const getProductsByLocation = catchAsync(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  const products = await inventoryRepository.fetchProductsWithSlabsByLocation(Number(locationId));

  if (!products.length) {
    return res.status(404).json({ message: "No products found for this location" });
  }

  SuccessResponse(res, 200, "Inventory data fetched successfully", products);
});

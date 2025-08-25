import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryRepository from "../services/inventory.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getProductsByLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, categorization } = req.query;
  const { locationId, } = req.params;
  const userId = req.user?.id;

  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  // Check if user has access to this location.
  await checkUserLocationAccess(Number(locationId), userId!);

  let data: any = {};

  if (categorization === "BLOCK") {
    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedByBlock(
      Number(page),
      Number(limit),
      Number(locationId)
    );

  } else if (categorization === "BUNDLE") {
    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedByLot(
      Number(page),
      Number(limit),
      Number(locationId)
    );

  } else {

    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedBySipl(
      Number(page),
      Number(limit),
      Number(locationId)
    );
  }

  if (!data.products.length) {
    return SuccessResponse(res, 200, "Inventory data fetched successfully", []);
  }

  SuccessResponse(res, 200, "Inventory data fetched successfully", data.products, {
    total: data.total,
    page: Number(page),
    limit: Number(limit),
  });
});



import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryRepository from "../services/inventory.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getProductsByLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, categorization } = req.query;
  const { locationId } = req.params;

  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  // Check if user has access to this location.
  await checkUserLocationAccess(Number(locationId), req.user!);

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
      req,
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

export const getProductsOnly = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 200, isSlabType } = req.query;
  const locationId = req.user?.defaultLocationId;

  if (!locationId) {
    return res.status(400).json({ error: "User has no default location" });
  }

  const data = await inventoryRepository.fetchProductsOnlyByLocation(
    Number(page),
    Number(limit),
    Number(locationId),
    isSlabType === 'true'
  );

  if (!data.products.length) {
    return SuccessResponse(res, 200, "Products fetched successfully", []);
  }

  SuccessResponse(res, 200, "Products fetched successfully", data.products, {
    total: data.total,
    page: Number(page),
    limit: Number(limit),
  });
});

export const getBlocksByProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const blocks = await inventoryRepository.fetchBlocksByProductAndLocation(Number(productId), Number(locationId));
  SuccessResponse(res, 200, "Blocks fetched successfully", blocks);
});

export const getBundlesByProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const bundles = await inventoryRepository.fetchBundlesByProductAndLocation(Number(productId), Number(locationId));
  SuccessResponse(res, 200, "Bundles fetched successfully", bundles);
});

export const getSiplsByProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const sipls = await inventoryRepository.fetchSiplsByProductAndLocation(req, Number(productId), Number(locationId));
  SuccessResponse(res, 200, "SIPLs fetched successfully", sipls);
});


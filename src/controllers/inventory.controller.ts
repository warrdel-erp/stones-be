import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryRepository from "../services/inventory.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getProductsByLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, categorization, isSlabType, search, subCategory } = req.query;
  const { locationId } = req.params;

  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  // Check if user has access to this location.
  await checkUserLocationAccess(Number(locationId), req.user!);

  let isSlab: boolean | undefined = undefined;
  if (isSlabType === 'true') isSlab = true;
  else if (isSlabType === 'false') isSlab = false;

  const searchStr = search ? String(search) : undefined;
  const subCategoryStr = subCategory ? String(subCategory) : undefined;

  let data: any = {};

  if (categorization === "BLOCK") {
    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedByBlock(
      Number(page),
      Number(limit),
      Number(locationId),
      isSlab,
      searchStr,
      subCategoryStr
    );

  } else if (categorization === "BUNDLE") {
    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedByLot(
      Number(page),
      Number(limit),
      Number(locationId),
      isSlab,
      searchStr,
      subCategoryStr
    );

  } else {

    // Get inventory data
    data = await inventoryRepository.fetchProductsWithSlabsByLocationGroupedBySipl(
      req,
      Number(page),
      Number(limit),
      Number(locationId),
      isSlab,
      searchStr,
      subCategoryStr
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
  const { page = 1, limit = 200, search, isSlabType, subCategory, ...filter } = req.query as any;
  const locationId = req.query.locationId ? Number(req.query.locationId) : req.user?.defaultLocationId;

  if (!locationId) {
    return res.status(400).json({ error: "User has no default location" });
  }

  const queryFilters: any = { ...filter };
  if (isSlabType === 'true') queryFilters.isSlabType = true;
  else if (isSlabType === 'false') queryFilters.isSlabType = false;
  if (subCategory) queryFilters.subCategory = subCategory;

  const data = await inventoryRepository.fetchProductsOnlyByLocation(
    Number(page),
    Number(limit),
    Number(locationId),
    queryFilters,
    search ? String(search) : undefined
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
  const { showSoldCanceled } = req.query;
  const excludeSoldCanceled = showSoldCanceled !== "true";
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const blocks = await inventoryRepository.fetchBlocksByProductAndLocation(req, Number(productId), Number(locationId), excludeSoldCanceled);
  SuccessResponse(res, 200, "Blocks fetched successfully", blocks);
});

export const getBundlesByProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { showSoldCanceled } = req.query;
  const excludeSoldCanceled = showSoldCanceled !== "true";
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const bundles = await inventoryRepository.fetchBundlesByProductAndLocation(req, Number(productId), Number(locationId), excludeSoldCanceled);
  SuccessResponse(res, 200, "Bundles fetched successfully", bundles);
});

export const getSiplsByProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { showSoldCanceled } = req.query;
  const excludeSoldCanceled = showSoldCanceled !== "true";
  const locationId = req.user?.defaultLocationId;

  if (!productId || !locationId) {
    return res.status(400).json({ error: "productId and default location are required" });
  }

  const sipls = await inventoryRepository.fetchSiplsByProductAndLocation(req, Number(productId), Number(locationId), excludeSoldCanceled);
  SuccessResponse(res, 200, "SIPLs fetched successfully", sipls);
});

export const getInventoryStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const locationId = req.user?.defaultLocationId;

  if (!locationId) {
    return res.status(400).json({ error: "User has no default location" });
  }

  const stats = await inventoryRepository.getInventoryStats(Number(locationId));
  SuccessResponse(res, 200, "Inventory stats fetched successfully", stats);
});


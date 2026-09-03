import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as productService from "../services/product.service";
import * as productBulkUploadService from "../services/productBulkUpload.service";
import { AppError } from "../helper/appError";

// Create a new product
export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  const product = await productService.addProduct(req.body, userId!, clientId!);
  SuccessResponse(res, 201, "Product created successfully", product);
});

// Get all products
export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, ...filter } = req.query as any;

  if (filter.isSlabType === 'true') {
    filter.isSlabType = true;
  }

  if (filter.isSlabType === 'false') {
    filter.isSlabType = false;
  }

  const result = await productService.fetchAllProducts(
    Number(page),
    Number(limit),
    search as string,
    filter
  );

  SuccessResponse(res, 200, "Users retrieved successfully", result.products, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get all products
export const getProductsWithCompactData = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 100, search, onlyWithSlabs, ...filter } = req.query as any;

  if (filter.isSlabType === 'true') {
    filter.isSlabType = true;
  }

  if (filter.isSlabType === 'false') {
    filter.isSlabType = false;
  }

  const result = await productService.fetchAllProductsWithCompactData(
    Number(page),
    Number(limit),
    search as string,
    filter,
    !!Number(onlyWithSlabs)
  );

  SuccessResponse(res, 200, "Users retrieved successfully", result.products, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get all products
export const getProductsTabsData = catchAsync(async (req: Request, res: Response) => {
  const { tab, productId } = req.params;

  const result = await productService.fetchProductsDataByTabs(tab, Number(productId));

  SuccessResponse(res, 200, "Users retrieved successfully", result);
});

// Update product
export const updateProductById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const updatedProduct = await productService.modifyProduct(Number(id), req.body, userId!);

  return SuccessResponse(res, 200, "Product updated successfully", updatedProduct);
});

// Get product by id
export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product: any = await productService.fetchProductById(Number(id));

  return SuccessResponse(res, 200, "Product fetched successfully", product);
});

// Get product by id
export const getLandedCost = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;

  const product: any = await productService.productLandedCosts(Number(productId));

  return SuccessResponse(res, 200, "Product landed costs fetched successfully", product);
});

// Get products with empty bin inventory
export const getProductsWithEmptyBinInventory = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query as any;

  const result = await productService.fetchProductsWithEmptyBinInventory(
    Number(page),
    Number(limit)
  );

  SuccessResponse(res, 200, "Products with empty bin retrieved successfully", result.products, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Bulk upload products via CSV
export const bulkUploadProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  if (!req.file) {
    throw new AppError("CSV file is required.", 400);
  }

  const result = await productBulkUploadService.bulkUploadProducts(req.file.buffer, userId!, clientId!);

  SuccessResponse(res, 201, "Products uploaded successfully", result);
});

export const addProductImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { s3FileId } = req.body;

  if (!s3FileId) {
    throw new AppError("s3FileId is required", 400);
  }

  const result = await productService.addProductImage(Number(id), Number(s3FileId));

  return SuccessResponse(res, 200, "Image added successfully", result);
});

export const deleteProductImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { imageId } = req.params;

  const result = await productService.deleteProductImage(Number(imageId));

  return SuccessResponse(res, 200, "Image deleted successfully", result);
});

export const getProductImages = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await productService.getProductImages(Number(id));

  return SuccessResponse(res, 200, "Images fetched successfully", result);
});

export const setPrimaryImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id, imageId } = req.params;

  const result = await productService.setPrimaryProductImage(Number(id), Number(imageId));

  return SuccessResponse(res, 200, "Primary image updated successfully", result);
});

export const getProductInventorySummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { locationId } = req.query;
  const clientId = req.user?.clientId;

  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  const result = await productService.fetchProductInventorySummary(
    Number(productId),
    Number(clientId),
    locationId ? Number(locationId) : undefined
  );

  return SuccessResponse(res, 200, "Product inventory summary retrieved successfully", result);
});




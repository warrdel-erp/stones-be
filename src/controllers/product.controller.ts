import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as productService from "../services/product.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const product = await productService.addProduct(req.body, userId!);
  SuccessResponse(res, 201, "Product created successfully", product);
});

// Get all products
export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;

  const result = await productService.fetchAllProducts(Number(page), Number(limit), search as string);

  SuccessResponse(res, 200, "Users retrieved successfully", result.products, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Update product
export const updateProductById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const updatedProduct = await productService.modifyProduct(Number(id), req.body, userId!);

  return SuccessResponse(res, 200, "Product updated successfully", updatedProduct);
});

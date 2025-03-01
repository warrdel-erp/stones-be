import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as productService from "../services/product.service";
import { SuccessResponse } from "../helper/response";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.addProduct(req.body);

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
export const updateProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedProduct = await productService.modifyProduct(Number(id), req.body);

  return SuccessResponse(res, 200, "Product updated successfully", updatedProduct);
});

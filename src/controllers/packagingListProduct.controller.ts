import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";
import { SuccessResponse } from "../helper/response";
import * as packagingListProductService from "../services/packagingListProduct.service";

export const upsertPackagingListProducts = catchAsync(async (req: Request, res: Response) => {
  const { packagingListId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const updatedProducts = await packagingListProductService.upsertPackagingListProducts(products, Number(packagingListId));

  return SuccessResponse(res, 200, "Packaging List products processed successfully", updatedProducts);
});

//  API to get all PackagingListProducts by PackagingListId
export const getPackagingListProducts = catchAsync(async (req, res) => {
  const { packagingListId } = req.params;

  const packagingListProducts = await packagingListProductService.getPackagingListProducts(Number(packagingListId));

  return SuccessResponse(res, 200, "Packaging List Products fetched successfully", packagingListProducts);
});

import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";
import { SuccessResponse } from "../helper/response";
import * as loadingOrderProductService from "../services/loadingOrderProduct.service";

export const upsertLoadingOrderProducts = catchAsync(async (req: Request, res: Response) => {
  const { loadingOrderId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const updatedProducts = await loadingOrderProductService.upsertLoadingOrderProducts(products, Number(loadingOrderId));

  return SuccessResponse(res, 200, "Loading order products processed successfully", updatedProducts);
});

//  API to get all LoadingOrderProducts by LoadingOrderId
export const getLoadingOrderProducts = catchAsync(async (req, res) => {
  const { loadingOrderId } = req.params;

  const loadingOrderProducts = await loadingOrderProductService.getLoadingOrderProducts(Number(loadingOrderId));

  return SuccessResponse(res, 200, "Loading Order Products fetched successfully", loadingOrderProducts);
});

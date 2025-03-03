import { Request, Response } from "express";
import * as requestedPurchaseProductService from "../services/requestedPurchaseProduct.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";

export const upsertRequestedPurchaseProducts = catchAsync(async (req: Request, res: Response) => {
  const { purchaseOrderId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const updatedProducts = await requestedPurchaseProductService.upsertRequestedPurchaseProducts(
    products,
    Number(purchaseOrderId)
  );

  return SuccessResponse(res, 200, "Requested Purchase Products processed successfully", updatedProducts);
});

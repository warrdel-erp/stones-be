import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as siplProductService from "../services/siplProduct.service";
import { SuccessResponse } from "../helper/response";

// Delete requested purchase product
export const deleteProductController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await siplProductService.deleteRequestedPurchaseProduct(Number(id));

  SuccessResponse(res, 200, "SIPL product deleted successfully", data);
});

// Delete all items for a SIPL product
export const deleteAllItemsController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await siplProductService.deleteAllSlabsForSiplProduct(Number(id));

  SuccessResponse(res, 200, "All items deleted successfully", data);
});


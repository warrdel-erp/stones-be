import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";
import { SuccessResponse } from "../helper/response";
import * as salesOrderProductService from "../services/salesOrderProduct.service";

// Add-Update sales order product
export const upsertSalesOrderProducts = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const updatedProducts = await salesOrderProductService.upsertSalesOrderProducts(products, Number(salesOrderId));

  return SuccessResponse(res, 200, "Sales order products processed successfully", updatedProducts);
});

// API to get all SalesOrderProducts by SalesOrderId
export const getSalesOrderProducts = catchAsync(async (req, res) => {
  const { salesOrderId } = req.params;

  const salesOrderProducts = await salesOrderProductService.getSalesOrderProducts(Number(salesOrderId));

  return SuccessResponse(res, 200, "Sales Order Products fetched successfully", salesOrderProducts);
});

export const updateSoProductPickedStatus = catchAsync(async (req: Request, res: Response) => {
  const { soProductId } = req.params;
  const { picked } = req.body;

  if (typeof picked !== "boolean") {
    return res.status(400).json({ error: "`picked` must be true or false" });
  }

  const result = await salesOrderProductService.updatePickedStatus(Number(soProductId), picked);

  SuccessResponse(res, 200, "SO Product picked status Updated successfully", result);
});

export const swapSalesOrderProduct = catchAsync(async (req: Request, res: Response) => {
  const { soProductId } = req.params;
  const { newInventoryProductId } = req.body;

  const data = await salesOrderProductService.swapSalesOrderProduct(Number(soProductId), newInventoryProductId);

  return SuccessResponse(res, 200, "Sales Order Product swapped successfully", data);
});

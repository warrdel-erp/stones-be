import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";
import { SuccessResponse } from "../helper/response";
import * as salesOrderProductService from "../services/salesOrderProduct.service";

// Update sales order products
export const updateSalesOrderProducts = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const updatedProducts = await salesOrderProductService.updateSalesOrderProducts(products);

  return SuccessResponse(res, 200, "Sales order products updated successfully", updatedProducts);
});

// API to get all SalesOrderProducts by SalesOrderId
export const getSalesOrderProducts = catchAsync(async (req, res) => {
  const { salesOrderId } = req.params;

  const salesOrderProducts = await salesOrderProductService.getSalesOrderProducts(Number(salesOrderId));

  return SuccessResponse(res, 200, "Sales Order Products fetched successfully", salesOrderProducts);
});

// API to add sales order products
export const addSalesOrderProducts = catchAsync(async (req, res) => {
  const { salesOrderId } = req.params;
  const products = req.body;

  if (!Array.isArray(products)) {
    throw new AppError("Invalid payload format. Expected an array.", 400);
  }

  const salesOrderProducts = await salesOrderProductService.createSalesOrderProducts(products, Number(salesOrderId));

  return SuccessResponse(res, 200, "Sales Order Products added successfully", salesOrderProducts);
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

  if (!req.body.newInventoryProductId) {
    throw new AppError("newInventoryProductId must be provided", 400);
  }

  const data = await salesOrderProductService.swapSalesOrderProduct(Number(soProductId), req.body);

  return SuccessResponse(res, 200, "Sales Order Product swapped successfully", data);
});

export const getSwapHistory = catchAsync(async (req: Request, res: Response) => {
  const { soProductId } = req.params;

  const swapHistory = await salesOrderProductService.getSwapHistory(Number(soProductId));

  return SuccessResponse(res, 200, "Swap history fetched successfully", swapHistory);
});

export const deleteSalesOrderProduct = catchAsync(async (req: Request, res: Response) => {
  const { soProductId } = req.params;

  if (!soProductId) {
    throw new AppError("Sales Order Product ID is required", 400);
  }

  const result = await salesOrderProductService.deleteSalesOrderProduct(Number(soProductId));

  return SuccessResponse(res, 200, result.message || "Sales Order Product deleted successfully", result);
});

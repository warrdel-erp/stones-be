import { Request, Response } from "express";
import * as salesOrderService from "../services/salesOrder.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

// Create new SO
export const createSalesOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const salesOrder = await salesOrderService.createSalesOrder({ ...req.body, userId });

  SuccessResponse(res, 201, "Sales Order created successfully", salesOrder);
});

// Get all SO
export const getAllSalesOrders = catchAsync(async (req: Request, res: Response) => {
  const salesOrders = await salesOrderService.getAllSalesOrders();
  SuccessResponse(res, 200, "Sales Orders retrieved successfully", salesOrders);
});

// Get SO by ID
export const getSalesOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const salesOrder = await salesOrderService.getSalesOrderById(Number(id));

  if (!salesOrder) {
    return SuccessResponse(res, 404, "Sales Order not found", null);
  }

  SuccessResponse(res, 200, "Sales Order retrieved successfully", salesOrder);
});

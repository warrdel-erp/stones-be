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
  const { page = 1, limit = 10 } = req.query;

  const result = await salesOrderService.getAllSalesOrders(Number(page), Number(limit));

  SuccessResponse(res, 200, "Sales Orders retrieved successfully", result.data, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
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

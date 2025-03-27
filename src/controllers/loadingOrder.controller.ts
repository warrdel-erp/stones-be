import { Request, Response } from "express";
import * as loadingOrderService from "../services/loadingOrder.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

// Create new LO
export const createLoadingOrder = catchAsync(async (req: Request, res: Response) => {
  const loadingOrder = await loadingOrderService.createLoadingOrder(req.body);
  SuccessResponse(res, 201, "Loading Order created successfully", loadingOrder);
});

// Get all LO
export const getAllLoadingOrders = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;

  const result = await loadingOrderService.getAllLoadingOrders(Number(page), Number(limit));

  SuccessResponse(res, 200, "Loading Orders retrieved successfully", result.data, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get loading order by Id
export const getLoadingOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const loadingOrder = await loadingOrderService.getLoadingOrderById(Number(id));

  if (!loadingOrder) {
    return SuccessResponse(res, 404, "Loading Order not found", null);
  }

  SuccessResponse(res, 200, "Loading Order retrieved successfully", loadingOrder);
});

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const loadingOrders = await loadingOrderService.getLoadingOrdersBySalesOrderId(Number(salesOrderId));

  SuccessResponse(res, 200, "Loading Orders retrieved successfully", loadingOrders);
});

// Update Loading Order
export const updateLoadingOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Remove invoiced key if present because it should not change invoice key. it should only be changed by it's specific API.
  const { invoiced, ...data } = req.body;

  const updatedLoadingOrder = await loadingOrderService.updateLoadingOrder(Number(id), data);

  if (!updatedLoadingOrder) {
    return SuccessResponse(res, 404, "Loading Order not found", null);
  }

  SuccessResponse(res, 200, "Loading Order updated successfully", updatedLoadingOrder);
});

// Update Loading Order
export const invoiceLoadingOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedLoadingOrder = await loadingOrderService.invoiceLoadingOrder(Number(id));

  SuccessResponse(res, 200, "Loading Order updated successfully", updatedLoadingOrder);
});

// Get new SO number
export const getNewLoNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await loadingOrderService.getLONumber(clientId!);
  SuccessResponse(res, 200, "New LO number fetched successfully.", data);
});
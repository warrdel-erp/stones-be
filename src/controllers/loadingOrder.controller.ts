import { Request, Response } from "express";
import * as loadingOrderService from "../services/loadingOrder.service";
import * as packagingListService from "../services/packagingList.service";
import catchAsync from "../helper/asyncCatch";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

// Create new LO
export const createLoadingOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { salesOrderId } = req.body;
  const clientId = req.user?.clientId;
  const createdById = req.user?.accountId;

  if (!salesOrderId) {
    throw new AppError("salesOrderId is required.", 400);
  }

  // Create loading order.
  const loadingOrder = await loadingOrderService.createLoadingOrder({ ...req.body, clientId, createdById });

  SuccessResponse(res, 201, "Loading Order created successfully", loadingOrder);
});

// Get all PL
export const getAllLoadingOrders = catchAsync(async (_req: Request, res: Response) => {
  const packagingLists = await loadingOrderService.getAllLoadingOrders();
  SuccessResponse(res, 200, "Packaging Lists retrieved successfully", packagingLists);
});

// Get Loading Order by Id
export const getLoadingOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const loadingOrder = await loadingOrderService.getLoadingOrderById(Number(id));

  if (!loadingOrder) {
    return SuccessResponse(res, 404, "Loading Order not found", null);
  }

  SuccessResponse(res, 200, "Loading Order retrieved successfully", loadingOrder);
});

// Get packaging list by SO id
export const getLoadingOrdersBySalesOrderId = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const packagingLists = await loadingOrderService.getLoadingOrdersBySalesOrderId(Number(salesOrderId));

  SuccessResponse(res, 200, "Packaging Lists retrieved successfully", packagingLists);
});

// Update Loading Order
export const updateLoadingOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get loading order by given id
  const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(Number(id)))?.get({
    plain: true,
  });

  if (!loadingOrder) {
    throw new AppError("Invalid Id", 400);
  }

  // Check if packaging list is invoiced then can't create loading order.
  await packagingListService.checkIfPackagingListInvoiced(loadingOrder.packagingListId, "update loading order");

  const updatedLoadingOrder = await loadingOrderService.updateLoadingOrder(Number(id), req.body);

  if (!updatedLoadingOrder) {
    return SuccessResponse(res, 404, "Loading Order not found", null);
  }

  SuccessResponse(res, 200, "Loading Order updated successfully", updatedLoadingOrder);
});

// Get new LO number
export const getNewPlNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const salesOrderId = req.query.salesOrderId ? Number(req.query.salesOrderId) : undefined;

  const data = await loadingOrderService.getPLNumber(clientId!, salesOrderId);
  SuccessResponse(res, 200, "New LO number fetched successfully.", data);
});

// Invoice Loading Order
export const invoiceLoadingOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user?.clientId;
  const locationId = req.user?.defaultLocationId;
  const createdById = req.user?.accountId;

  const result = await loadingOrderService.invoiceLoadingOrder(Number(id), clientId!, Number(locationId));

  SuccessResponse(res, 201, "Loading Order invoiced successfully", result);
});

export const getLoadingOrdersForDelivery = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, deliveryStatus, ...filters } = req.query;
  const clientId = Number(req.user?.clientId);

  if (deliveryStatus) {
    filters.deliveryStatus = deliveryStatus;
  }

  const result = await loadingOrderRepository.getAllLoadingOrdersForDelivery(
    Number(page),
    Number(limit),
    clientId,
    filters
  );

  SuccessResponse(res, 200, "Loading orders for delivery fetched successfully", {
    data: result.data,
    paginationData: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});

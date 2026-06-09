import { Request, Response } from "express";
import * as packagingListService from "../services/packagingList.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

// Create new LO
export const createPackagingList = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const packagingList = await packagingListService.createPackagingList({ ...req.body, clientId });
  SuccessResponse(res, 201, "Packaging List created successfully", packagingList);
});

// Get all LO
export const getAllPackagingLists = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  const clientId = req.user?.clientId;

  const result = await packagingListService.getAllPackagingLists(Number(page), Number(limit), Number(clientId), filters);

  SuccessResponse(res, 200, "Loading Orders retrieved successfully", result.data, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get packaging list by Id
export const getPackagingListById = catchAsync(async (req: Request, res: Response) => {
  const { id, } = req.params;

  const packagingList = await packagingListService.getPackagingListById(Number(id));

  if (!packagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List retrieved successfully", packagingList);
});

// Get packaging list by Id
export const getPackagingListAsPerReturn = catchAsync(async (req: Request, res: Response) => {
  const { returnId } = req.params;

  const packagingList = await packagingListService.getPackagingListAsPerReturn(Number(returnId));

  if (!packagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List retrieved successfully", packagingList);
});

// Get packaging list by Id
export const getPackagingListOnlyAsPerReturn = catchAsync(async (req: Request, res: Response) => {
  const { returnId } = req.params;

  const packagingList = await packagingListService.getPackagingListOnlyAsPerReturn(Number(returnId));

  if (!packagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List retrieved successfully", packagingList);
});

// Get packaging list by SO id
export const getPackagingListsBySalesOrderId = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const loadingOrders = await packagingListService.getPackagingListsBySalesOrderId(Number(salesOrderId));

  SuccessResponse(res, 200, "Loading Orders retrieved successfully", loadingOrders);
});

// Update Packaging List
export const updatePackagingList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Remove stage key if present because it should not change stage key. it should only be changed by it's specific API.
  const { stage, ...data } = req.body;

  const updatedPackagingList = await packagingListService.updatePackagingList(Number(id), data);

  if (!updatedPackagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List updated successfully", updatedPackagingList);
});

// Update Packaging List
export const invoicePackagingList = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user?.clientId;
  const locationId = req.user?.defaultLocationId;

  const updatedPackagingList = await packagingListService.invoicePackagingList(Number(id), clientId!, Number(locationId));

  SuccessResponse(res, 200, "Packaging List updated successfully", updatedPackagingList);
});

// Get new SO number
export const getNewPlNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const salesOrderId = req.query.salesOrderId ? Number(req.query.salesOrderId) : undefined;

  const data = await packagingListService.getPLNumber(clientId!, salesOrderId);
  SuccessResponse(res, 200, "New PL number fetched successfully.", data);
});

// Cancel Packaging List
export const cancelPackagingList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await packagingListService.cancelPackagingList(Number(id));

  SuccessResponse(res, 200, "Packaging List canceled successfully", result);
});

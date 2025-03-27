import { Request, Response } from "express";
import * as packagingListService from "../services/packagingList.service";
import * as loadingOrderService from "../services/loadingOrder.service";
import catchAsync from "../helper/asyncCatch";
import * as packagingListRepository from "../repositories/packagingList.repository";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

// Create new PL
export const createPackagingList = catchAsync(async (req: AuthRequest, res: Response) => {
  const { loadingOrderId } = req.body;
  const clientId = req.user?.clientId;

  // Check if loading order is invoiced then can't create packaging list.
  await loadingOrderService.checkIfLoadingOrderInvoiced(loadingOrderId, "create packaging list");

  // Create packaging list.
  const packagingList = await packagingListService.createPackagingList({ ...req.body, clientId });

  SuccessResponse(res, 201, "Packaging List created successfully", packagingList);
});

// Get all PL
export const getAllPackagingLists = catchAsync(async (_req: Request, res: Response) => {
  const packagingLists = await packagingListService.getAllPackagingLists();
  SuccessResponse(res, 200, "Packaging Lists retrieved successfully", packagingLists);
});

// Get Packaging List by Id
export const getPackagingListById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const packagingList = await packagingListService.getPackagingListById(Number(id));

  if (!packagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List retrieved successfully", packagingList);
});

// Get loading order by SO id
export const getPackagingListsBySalesOrderId = catchAsync(async (req: Request, res: Response) => {
  const { salesOrderId } = req.params;
  const packagingLists = await packagingListService.getPackagingListsBySalesOrderId(Number(salesOrderId));

  SuccessResponse(res, 200, "Packaging Lists retrieved successfully", packagingLists);
});

// Update Packaging List
export const updatePackagingList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get packaging list by given id
  const packagingList = (await packagingListRepository.getPackagingListByIdSimple(Number(id)))?.get({
    plain: true,
  });

  if (!packagingList) {
    throw new AppError("Invalid Id", 400);
  }

  // Check if loading order is invoiced then can't create packaging list.
  await loadingOrderService.checkIfLoadingOrderInvoiced(packagingList.loadingOrderId, "update packaging list");

  const updatedPackagingList = await packagingListService.updatePackagingList(Number(id), req.body);

  if (!updatedPackagingList) {
    return SuccessResponse(res, 404, "Packaging List not found", null);
  }

  SuccessResponse(res, 200, "Packaging List updated successfully", updatedPackagingList);
});


// Get new PL number
export const getNewPlNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await packagingListService.getPLNumber(clientId!);
  SuccessResponse(res, 200, "New PL number fetched successfully.", data);
});
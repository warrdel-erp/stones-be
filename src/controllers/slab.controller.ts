import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as slabService from "../services/slab.service";
import * as slabRemeasurementService from "../services/slabRemeasurement.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import { SplitSlabInput } from "../validators";

// 🔹 Get SlabLogs by SlabId
export const getSlabWithLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const slabId = parseInt(req.params.slabId);
  const slabLogs = await slabService.getSlabLogsBySlabIdService(slabId);
  SuccessResponse(res, 200, "Slab logs for given Slab ID fetched", slabLogs);
});

// 🔹 Create SlabLog
export const createSlabLog = catchAsync(async (req: Request, res: Response) => {
  const { slabId } = req.params;
  const slabLog = await slabRemeasurementService.createSlabLogService({ ...req.body, slabId });
  SuccessResponse(res, 201, "Slab log created successfully", slabLog);
});

// Get all slabs with filter
export const getAllSlabs = catchAsync(async (req: AuthRequest, res: Response) => {
  const filters = req.query;

  const locationId = req.user?.defaultLocationId

  const slabs = await slabService.fetchAllSlabs(filters, undefined, Number(locationId));
  return SuccessResponse(res, 200, "Slabs fetched successfully", slabs);
});

// Update slab
export const updateSlab = catchAsync(async (req: Request, res: Response) => {
  const { slabId } = req.params;
  const updateData = req.body;

  if (!slabId || isNaN(Number(slabId))) {
    throw new AppError("Invalid slab ID", 400);
  }

  // Update slab
  const updatedSlab = await slabService.updateSlab(Number(slabId), updateData);

  if (!updatedSlab) {
    throw new AppError("Slab not found", 404);
  }

  return SuccessResponse(res, 200, "Slab updated successfully", updatedSlab);
});

// Bulk update slabs
export const bulkUpdateSlabs = catchAsync(async (req: Request, res: Response) => {
  const slabsData = req.body;

  if (!Array.isArray(slabsData) || slabsData.length === 0) {
    throw new AppError("Invalid request. Provide an array of slabs with updates.", 400);
  }

  const affectedRows = await slabService.bulkUpdateSlabs(slabsData);

  if (affectedRows === 0) {
    throw new AppError("No slabs were updated. Check if IDs exist.", 404);
  }

  return SuccessResponse(res, 200, `${affectedRows} slabs updated successfully.`, affectedRows);
});

// Check if all slabs in a SIPL are fully filled
export const checkSiplSlabsFullyFilled = catchAsync(async (req: Request, res: Response) => {
  const { siplId } = req.params;

  if (!siplId || isNaN(Number(siplId))) {
    throw new AppError("Invalid SIPL ID", 400);
  }

  const result = await slabService.checkSiplSlabsFullyFilled(Number(siplId));

  return SuccessResponse(res, 200, result.message, result);
});

// Split a slab into multiple pieces
export const splitSlab = catchAsync(async (req: AuthRequest, res: Response) => {
  const { slabId } = req.params;
  const body: SplitSlabInput = req.body;
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  if (!slabId || isNaN(Number(slabId))) {
    throw new AppError("Invalid slab ID", 400);
  }

  if (!clientId) {
    throw new AppError("Client ID is required", 400);
  }

  const result = await slabService.splitSlab(Number(slabId), body.slabs, userId, clientId);

  return SuccessResponse(res, 200, "Slab split successfully", result);
});

// Get split history for a slab
export const getSlabSplitHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { slabId } = req.params;
  const clientId = req.user?.clientId;

  if (!slabId || isNaN(Number(slabId))) {
    throw new AppError("Invalid slab ID", 400);
  }

  const history = await slabService.getSlabSplitHistory(Number(slabId), clientId);

  return SuccessResponse(res, 200, "Slab split history fetched successfully", history);
});

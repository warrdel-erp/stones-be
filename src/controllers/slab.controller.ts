import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as slabService from "../services/slab.service";
import * as slabRemeasurementService from "../services/slabRemeasurement.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

export const updateSlabHoldStatus = catchAsync(async (req: Request, res: Response) => {
  const { slabId } = req.params;
  const { isHold } = req.body;

  if (typeof isHold !== "boolean") {
    return res.status(400).json({ error: "`isHold` must be true or false" });
  }

  const result = await slabService.updateSlabHoldStatus(Number(slabId), isHold);

  SuccessResponse(res, 200, "Slab Hold status Updated successfully", result);
});

export const updateSlabCartStatus = catchAsync(async (req: Request, res: Response) => {
  const { slabId } = req.params;
  const { isInCart } = req.body;

  if (typeof isInCart !== "boolean") {
    return res.status(400).json({ error: "`isInCart` must be true or false" });
  }

  const result = await slabService.updateSlabCartStatus(Number(slabId), isInCart);

  SuccessResponse(res, 200, "Slab Cart status Updated successfully", result);

  return res.json(result);
});

// 🔹 Get SlabLogs by SlabId
export const getSlabWithLogs = catchAsync(async (req: Request, res: Response) => {
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

export const getCartCount = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  if (!clientId) {
    throw new AppError("Missing client information", 401);
  }

  const result = await slabService.getCartCount(clientId);
  return SuccessResponse(res, 200, "Cart count retrieved successfully", result);
});

import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as AreaService from "../services/area.service";
import Warehouse from "../models/warehouse.model";
import { scoped } from "../utils/scoped";

export const createArea = catchAsync(async (req: AuthRequest, res: Response) => {
  let warehouseId = req.body.warehouseId;
  
  if (!warehouseId) {
    const warehouse = await scoped(Warehouse).findOne({ where: { locationId: req.user!.defaultLocationId } });
    if (!warehouse) throw new AppError("Default warehouse not found", 404);
    warehouseId = (warehouse as any).id;
  }

  const warehouse = await scoped(Warehouse).findByPk(warehouseId);
  if (!warehouse) {
    throw new AppError("Warehouse not found", 404);
  }
  
  // Assign locationId from the warehouse
  const areaData = {
    ...req.body,
    warehouseId,
    locationId: (warehouse as any).locationId,
  };

  const newArea = await AreaService.createArea(areaData, req.user!.clientId);
  SuccessResponse(res, 201, "Area created successfully", newArea);
});

export const getAreas = catchAsync(async (req: AuthRequest, res: Response) => {
  // Get warehouse for the user's default location
  const warehouse = await scoped(Warehouse).findOne({ where: { locationId: req.user!.defaultLocationId } });
  if (!warehouse) {
    throw new AppError("Default warehouse not found", 404);
  }
  const areas = await AreaService.getAreasByWarehouse((warehouse as any).id);
  SuccessResponse(res, 200, "Areas fetched successfully", areas);
});

export const getAreasByWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
  const warehouseId = parseInt(req.params.warehouseId, 10);
  const areas = await AreaService.getAreasByWarehouse(warehouseId);
  SuccessResponse(res, 200, "Areas fetched successfully", areas);
});

export const getAreaById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const area = await AreaService.getAreaById(id);
  if (!area) {
    throw new AppError("Area not found", 404);
  }
  SuccessResponse(res, 200, "Area fetched successfully", area);
});

export const updateArea = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const area = await AreaService.updateArea(id, req.body);
  if (!area) {
    throw new AppError("Area not found", 404);
  }
  SuccessResponse(res, 200, "Area updated successfully", area);
});

export const deleteArea = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await AreaService.deleteArea(id);
  if (!deleted) {
    throw new AppError("Area not found", 404);
  }
  SuccessResponse(res, 200, "Area deleted successfully", {});
});

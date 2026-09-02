import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import * as salesOrderRequirementService from "../services/salesOrderRequirement.service";

export const getRequirements = catchAsync(async (req: AuthRequest, res: Response) => {
  const salesOrderId = req.params.salesOrderId;
  const clientId = Number(req.user?.clientId);
  const data = await salesOrderRequirementService.getRequirementLinesAndAllocations(Number(salesOrderId), clientId);
  return SuccessResponse(res, 200, "Requirements fetched successfully", data);
});

export const addRequirementLine = catchAsync(async (req: AuthRequest, res: Response) => {
  const salesOrderId = req.params.salesOrderId;
  const clientId = Number(req.user?.clientId);
  const locationId = Number(req.user?.defaultLocationId);
  const data = await salesOrderRequirementService.addRequirementLine(Number(salesOrderId), clientId, req.body, locationId);
  return SuccessResponse(res, 201, "Requirement line added successfully", data);
});

export const updateAllocations = catchAsync(async (req: AuthRequest, res: Response) => {
  const salesOrderId = req.params.salesOrderId;
  const reqId = req.params.reqId;
  const clientId = Number(req.user?.clientId);
  const { inventoryProductIds } = req.body;
  const data = await salesOrderRequirementService.updateRequirementAllocations(Number(salesOrderId), Number(reqId), clientId, inventoryProductIds);
  return SuccessResponse(res, 200, "Allocations updated successfully", data);
});

export const deleteRequirementLine = catchAsync(async (req: AuthRequest, res: Response) => {
  const salesOrderId = req.params.salesOrderId;
  const reqId = req.params.reqId;
  const clientId = Number(req.user?.clientId);
  const data = await salesOrderRequirementService.removeRequirementLine(Number(salesOrderId), Number(reqId), clientId);
  return SuccessResponse(res, 200, "Requirement line deleted successfully", data);
});

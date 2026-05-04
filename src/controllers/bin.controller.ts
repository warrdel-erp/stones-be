import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as binService from "../services/bin.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getBinsByLocationController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { locationId } = req.params;

  // Check if user has access to this location.
  await checkUserLocationAccess(Number(locationId), req.user!);

  const bins = await binService.getBinsByLocation(Number(locationId));
  SuccessResponse(res, 200, "Bin list according to location fetched", bins);
});

export const createBin = catchAsync(async (req: AuthRequest, res: Response) => {
  const defaultLocationId = req.user?.defaultLocationId!;
  const bin = await binService.create(req.body, defaultLocationId);
  SuccessResponse(res, 201, "Bin created", bin);
});

export const getAllBins = catchAsync(async (req: AuthRequest, res: Response) => {
  const bins = await binService.getAll();
  SuccessResponse(res, 200, "Bins fetched", bins);
});

export const getBin = catchAsync(async (req: AuthRequest, res: Response) => {
  const bin = await binService.getOne(+req.params.id);
  SuccessResponse(res, 200, "Bin details", bin);
});

export const updateBin = catchAsync(async (req: AuthRequest, res: Response) => {
  const bin = await binService.update(+req.params.id, req.body);
  SuccessResponse(res, 200, "Bin updated", bin);
});

export const deleteBin = catchAsync(async (req: AuthRequest, res: Response) => {
  await binService.remove(+req.params.id);
  SuccessResponse(res, 200, "Bin deleted", {});
});

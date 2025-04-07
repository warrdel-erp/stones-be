import { Request, Response } from "express";
import * as truckService from "../services/truck.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

export const createTruckController = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const truck = await truckService.createTruck({ ...req.body, clientId });

  SuccessResponse(res, 201, "Truck created successfully", truck);
});

export const getAllTrucksController = catchAsync(async (_req: Request, res: Response) => {
  const trucks = await truckService.getAllTrucks();
  SuccessResponse(res, 200, "Trucks fetched successfully", trucks);
});

export const getTruckByIdController = catchAsync(async (req: Request, res: Response) => {
  const truck = await truckService.getTruckById(Number(req.params.id));
  SuccessResponse(res, 200, "Truck fetched successfully", truck);
});

export const updateTruckController = catchAsync(async (req: Request, res: Response) => {
  const truck = await truckService.updateTruck(Number(req.params.id), req.body);
  SuccessResponse(res, 200, "Truck updated successfully", truck);
});

export const deleteTruckController = catchAsync(async (req: Request, res: Response) => {
  await truckService.deleteTruck(Number(req.params.id));
  SuccessResponse(res, 200, "Truck deleted successfully", null);
});

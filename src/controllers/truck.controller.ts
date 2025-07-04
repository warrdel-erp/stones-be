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

export const getAllTrucksController = catchAsync(async (req: Request, res: Response) => {
  // Support notAssignedOnly query param to filter trucks with no pending deliveries
  const { page = 1, limit = 10, notAssignedOnly, ...filter } = req.query;
  const filters = { ...filter };
  if (notAssignedOnly !== undefined) {
    // Always store as string to avoid type errors
    filters.notAssignedOnly = String(notAssignedOnly);
  }
  const { rows, count } = await truckService.getAllTrucks(Number(page), Number(limit), filters);

  SuccessResponse(res, 200, "Trucks fetched successfully", rows, {
    limit: Number(limit),
    page: Number(page),
    total: count
  });
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

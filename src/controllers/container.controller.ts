import { Request, Response } from "express";
import * as containerService from "../services/container.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createContainer = catchAsync(async (req: Request, res: Response) => {
  const container = await containerService.createContainer(req.body);
  return SuccessResponse(res, 201, "Container created successfully", container);
});

export const getAllContainers = catchAsync(async (req: Request, res: Response) => {
  const containers = await containerService.getAllContainers();
  return SuccessResponse(res, 200, "Containers retrieved successfully", containers);
});

export const getContainerById = catchAsync(async (req: Request, res: Response) => {
  const container = await containerService.getContainerById(Number(req.params.id));
  return SuccessResponse(res, 200, "Container retrieved successfully", container);
});

export const updateContainer = catchAsync(async (req: Request, res: Response) => {
  const container = await containerService.updateContainer(Number(req.params.id), req.body);
  return SuccessResponse(res, 200, "Container updated successfully", container);
});

export const deleteContainer = catchAsync(async (req: Request, res: Response) => {
  await containerService.deleteContainer(Number(req.params.id));
  return SuccessResponse(res, 200, "Container deleted successfully", {});
});

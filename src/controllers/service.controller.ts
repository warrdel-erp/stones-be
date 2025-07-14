import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as serviceService from "../services/service.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createService = catchAsync(async (req: AuthRequest, res: Response) => {
    const payload = { ...req.body };
    const service = await serviceService.create(payload);
    SuccessResponse(res, 201, "Service created", service);
});

export const getAllServices = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const services = await serviceService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Services fetched", services);
});

export const getService = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const service = await serviceService.getOne(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Service details", service);
});

export const updateService = catchAsync(async (req: AuthRequest, res: Response) => {
    const service = await serviceService.update(+req.params.id, req.body);
    SuccessResponse(res, 200, "Service updated", service);
});

export const deleteService = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    await serviceService.remove(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Service deleted", {});
}); 
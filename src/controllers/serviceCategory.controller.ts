import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as serviceCategoryService from "../services/serviceCategory.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createServiceCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const payload = { ...req.body, clientId: req.user?.clientId };
    const category = await serviceCategoryService.create(payload);
    SuccessResponse(res, 201, "Service Category created", category);
});

export const getAllServiceCategories = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const categories = await serviceCategoryService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Service Categories fetched", categories);
});

export const getServiceCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const category = await serviceCategoryService.getOne(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Service Category details", category);
});

export const updateServiceCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const category = await serviceCategoryService.update(+req.params.id, req.body);
    SuccessResponse(res, 200, "Service Category updated", category);
});

export const deleteServiceCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    await serviceCategoryService.remove(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Service Category deleted", {});
}); 
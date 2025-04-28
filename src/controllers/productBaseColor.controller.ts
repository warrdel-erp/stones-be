import { Request, Response } from "express";
import * as productBaseColorService from "../services/productBaseColor.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

export const createProductBaseColor = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const baseColor = await productBaseColorService.create({ ...req.body, createdBy: userId });
    SuccessResponse(res, 201, "Product Base Color created successfully", baseColor);
});

export const getAllProductBaseColors = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const baseColors = await productBaseColorService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Product Base Colors retrieved successfully", baseColors);
});

export const getProductBaseColorById = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const baseColor = await productBaseColorService.getById(+req.params.id, Number(clientId));
    if (!baseColor) {
        throw new AppError("Product Base Color not found", 404);
    }
    SuccessResponse(res, 200, "Product Base Color retrieved successfully", baseColor);
});

export const updateProductBaseColor = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const baseColor = await productBaseColorService.update(+req.params.id, { ...req.body, updatedBy: userId });
    if (!baseColor) {
        throw new AppError("Product Base Color not found", 404);
    }
    SuccessResponse(res, 200, "Product Base Color updated successfully", baseColor);
});

export const deleteProductBaseColor = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const success = await productBaseColorService.remove(+req.params.id, Number(clientId));
    if (!success) {
        throw new AppError("Product Base Color not found", 404);
    }
    SuccessResponse(res, 200, "Group deleted successfully", {});
});
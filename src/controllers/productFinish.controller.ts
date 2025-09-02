import { Response } from "express";
import { AppError } from "../helper/appError";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as productFinishService from "../services/productFinish.service";

export const createFinish = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const clientId = req.user?.clientId;

    const finish = await productFinishService.create({ ...req.body, createdBy: userId, updatedBy: userId, clientId });
    SuccessResponse(res, 201, "Finish created successfully", finish);
});

export const getAllFinishes = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const finishes = await productFinishService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Product Finishes retrieved successfully", finishes);
});

export const getFinishById = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const finish = await productFinishService.getById(req.params.id, Number(clientId));
    if (!finish) {
        throw new AppError("Finish not found", 404);
    }
    SuccessResponse(res, 200, "Finish retrieved successfully", finish);
});

export const updateFinish = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const finish = await productFinishService.update(req.params.id, { ...req.body, updatedBy: userId });
    if (!finish) {
        throw new AppError("Finish not found", 404);
    }
    SuccessResponse(res, 200, "Finish updated successfully", finish);
});

export const removeFinish = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const success = await productFinishService.remove(req.params.id, Number(clientId));
    if (!success) {
        return res.status(404).json({ message: "Finish not found" });
    }
    SuccessResponse(res, 200, "Finish deleted successfully", {});
});
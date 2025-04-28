import { Request, Response } from "express";
import * as productGroupService from "../services/productGroup.service";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";

export const createGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const group = await productGroupService.create({ ...req.body, createdBy: userId, updatedBy: userId });
    SuccessResponse(res, 201, "Group created successfully", group);
});

export const getAllGroups = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const groups = await productGroupService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Product Groups retrieved successfully", groups);
});

export const getGroupById = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const group = await productGroupService.getById(req.params.id, Number(clientId));
    if (!group) {
        throw new AppError("Group not found", 404);
    }
    SuccessResponse(res, 200, "Group retrieved successfully", group);
});

export const updateGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const group = await productGroupService.update(req.params.id, { ...req.body, updatedBy: userId });
    if (!group) {
        throw new AppError("Group not found", 404);
    }
    SuccessResponse(res, 200, "Group updated successfully", group);
});

export const removeGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const success = await productGroupService.remove(req.params.id, Number(clientId));
    if (!success) {
        return res.status(404).json({ message: "Group not found" });
    }
    SuccessResponse(res, 200, "Group deleted successfully", {});
});
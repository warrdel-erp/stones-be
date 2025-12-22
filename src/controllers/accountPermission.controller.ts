import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as accountPermissionService from "../services/accountPermission.service";
import { AppError } from "../helper/appError";

// Get My Permissions
export const getMyPermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const accountId = req.user?.accountId;
    if (!accountId) {
        throw new AppError("User not authenticated", 401);
    }

    const permissions = await accountPermissionService.getPermissionsByAccountId(accountId);
    return SuccessResponse(res, 200, "Permissions retrieved successfully", permissions);
});

// Get Account Permissions by ID
export const getAccountPermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const accountId = Number(req.params.accountId);

    if (!accountId || isNaN(accountId)) {
        throw new AppError("Invalid Account ID", 400);
    }

    const permissions = await accountPermissionService.getPermissionsByAccountId(accountId);
    return SuccessResponse(res, 200, "Account permissions retrieved successfully", permissions);
});

// Update Account Permissions
export const updatePermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { accountId, permissions } = req.body;

    if (!accountId) {
        throw new AppError("Account ID is required", 400);
    }

    if (!Array.isArray(permissions)) {
        throw new AppError("Permissions must be an array", 400);
    }

    const updatedPermissions = await accountPermissionService.updateAccountPermissions(accountId, permissions);
    return SuccessResponse(res, 200, "Permissions updated successfully", updatedPermissions);
});

import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as accountService from "../services/account.service";
import * as userService from "../services/user.service";
import * as clientService from "../services/client.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }

    const result = await accountService.authenticateAccount(email, password);
    if (!result) {
        throw new AppError("Invalid credentials", 401);
    }

    SuccessResponse(res, 200, "Login successful", result);
});

export const getUserProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError("User not authenticated", 401);
    }

    let profile: any;
    if (req.user.accountType === "user") {
        profile = await userService.getUserProfile(req.user.id);
    } else if (req.user.accountType === "client") {
        profile = await clientService.getClientProfile(req.user.id);
    } else {
        throw new AppError("Invalid account type", 400);
    }

    SuccessResponse(res, 200, "User profile fetched successfully", profile);
});

export const getMyDetails = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError("User not authenticated", 401);
    }

    let details: any = req.user;

    if (details.accountType == 'user') {
        details = await userService.getUserProfile(req.user.id);
        details.fullName = details.username
    } else if (details.accountType == 'client') {
        details = await clientService.getClientProfileSimple(req.user.id);
    }

    SuccessResponse(res, 200, "User profile fetched successfully", { ...details, moreDetails: req.user });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.accountId) {
        throw new AppError("User not authenticated", 401);
    }

    const { oldPassword, newPassword } = req.body;

    const result = await accountService.changePassword(
        req.user.accountId,
        oldPassword,
        newPassword
    );

    SuccessResponse(res, 200, "Password changed successfully", result);
}); 
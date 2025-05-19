import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
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

    const result = await userService.loginUser(email, password);

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
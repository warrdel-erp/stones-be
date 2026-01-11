import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import * as userService from "../services/user.service";
import * as clientService from "../services/client.service";
import * as accountService from "../services/account.service";

// Get locations based on account type (user or client)
export const getAccountLocations = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError("User not authenticated", 401);
    }

    let locations;
    if (req.user.accountType === "user") {
        locations = await userService.userLocations(req.user.id);
    } else if (req.user.accountType === "client") {
        locations = await clientService.getClientLocations(req.user.clientId);
    } else {
        throw new AppError("Invalid account type", 400);
    }

    return SuccessResponse(res, 200, "Locations fetched successfully", locations);
});

// Check if email exists in accounts
export const checkEmailExists = catchAsync(async (req: AuthRequest, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        throw new AppError("Email is required", 400);
    }

    const exists = await accountService.checkEmailAvailability(email);

    return SuccessResponse(res, 200, "Email check completed", { exists });
});

// Get account by ID
export const getAccountById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("Account ID is required", 400);
    }

    const account = await accountService.getAccountById(Number(id));

    return SuccessResponse(res, 200, "Account fetched successfully", account);
});

// Set default location based on account type (user or client)
export const setDefaultLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError("User not authenticated", 401);
    }

    const { locationId } = req.body;
    if (!locationId) {
        throw new AppError("Location ID is required", 400);
    }

    let response;
    if (req.user.accountType === "user") {
        response = await userService.assignDefaultLocation(req.user.id, locationId);
    } else if (req.user.accountType === "client") {
        response = await clientService.assignDefaultLocation(req.user.clientId, locationId);
    } else {
        throw new AppError("Invalid account type", 400);
    }

    return SuccessResponse(res, 200, "Default location updated successfully", response);
});



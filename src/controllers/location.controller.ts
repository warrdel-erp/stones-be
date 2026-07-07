import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as locationService from "../services/location.service";

export const createLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const payload = { ...req.body, clientId };

    const location = await locationService.createLocation(payload);
    SuccessResponse(res, 201, "Location created successfully", location);
});

export const getLocationById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    const location = await locationService.getLocationById(Number(id), Number(clientId));

    SuccessResponse(res, 200, "Location retrieved successfully", location);
});

export const updateLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;
    const payload = req.body;

    const location = await locationService.updateLocation(Number(id), payload, Number(clientId));

    SuccessResponse(res, 200, "Location updated successfully", location);
});



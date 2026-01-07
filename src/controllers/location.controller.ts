import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as locationService from "../services/location.service";

export const getLocationById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    const location = await locationService.getLocationById(Number(id), Number(clientId));

    SuccessResponse(res, 200, "Location retrieved successfully", location);
});


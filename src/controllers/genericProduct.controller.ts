import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as genericProductService from "../services/genericProduct.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

// Get all generic products with filter
export const getAllGenericProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = req.query;
    const locationId = req.user?.defaultLocationId;

    const genericProducts = await genericProductService.fetchAllGenericProducts(filters, undefined, Number(locationId));
    return SuccessResponse(res, 200, "Generic Products fetched successfully", genericProducts);
}); 
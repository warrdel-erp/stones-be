import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as genericProductService from "../services/genericProduct.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../helper/appError";

// Get all generic products with filter
export const getAllGenericProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = req.query;
    const locationId = req.user?.defaultLocationId;

    const genericProducts = await genericProductService.fetchAllGenericProducts(filters, undefined, Number(locationId));
    return SuccessResponse(res, 200, "Generic Products fetched successfully", genericProducts);
});

// Delete generic product
export const deleteGenericProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
        throw new AppError("Invalid generic product ID", 400);
    }
    const result = await genericProductService.deleteGenericProduct(id);
    return SuccessResponse(res, 200, "Generic product deleted successfully", result);
});
 
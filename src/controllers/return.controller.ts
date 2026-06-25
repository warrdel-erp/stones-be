import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as returnService from "../services/return.service";
import { AppError } from "../helper/appError";

export const createReturn = catchAsync(async (req: AuthRequest, res: Response) => {
    const { productIds, invoiceId, services } = req.body;
    const userId = req.user?.id;
    const clientId = req.user?.clientId;

    if (!userId) {
        throw new AppError("User not authenticated", 401);
    }
    const returnRecord = await returnService.createReturn(Number(invoiceId), productIds, userId, services, Number(clientId));
    SuccessResponse(res, 201, "Return created successfully", returnRecord);
});

export const confirmReturn = catchAsync(async (req: AuthRequest, res: Response) => {
    const { returnId } = req.params;
    const clientId = req.user?.clientId;
    const locationId = req.user?.defaultLocationId;

    const returnRecord = await returnService.confirmReturn(Number(returnId), Number(locationId), Number(clientId));
    SuccessResponse(res, 200, "Return confirmed successfully", returnRecord);
});

export const cancelReturn = catchAsync(async (req: AuthRequest, res: Response) => {
    const { returnId } = req.params;
    const returnRecord = await returnService.cancelReturn(Number(returnId));
    SuccessResponse(res, 200, "Return canceled successfully", returnRecord);
});

export const getAllReturnsPaginated = catchAsync(async (req: AuthRequest, res: Response) => {
    // const page = parseInt(req.query.page as string) || 1;
    // const limit = parseInt(req.query.limit as string) || 10;

    const { page = 1, limit = 10, status, search } = req.query;

    const filter: any = {};
    if (status) {
        filter.status = status;
    }

    const clientId = req.user?.clientId;
    const result = await returnService.getAllReturnsPaginated(Number(page), Number(limit), Number(clientId), filter, search as string);
    SuccessResponse(res, 200, "Returns fetched successfully", result.rows, {
        limit: Number(limit),
        page: Number(page),
        total: result.count
    });
});

export const updateReturnProductsAndConfirm = catchAsync(async (req: AuthRequest, res: Response) => {
    const { productIds } = req.body;
    const { returnId } = req.params;
    const clientId = req.user?.clientId;
    const locationId = req.user?.defaultLocationId;

    if (!productIds.length) {
        throw new AppError('productIds are required', 400);
    }

    const returnRecord = await returnService.updateReturnProductsAndConfirm(Number(returnId), Number(locationId), productIds, Number(clientId));
    SuccessResponse(res, 200, "Return products updated and confirmed successfully", returnRecord);
}); 
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as holdService from "../services/hold.service";

/**
 * Create a new hold
 */
export const createHold = catchAsync(async (req: AuthRequest, res: Response) => {
    const { customerId, inventoryProductIds, description, fabricatorId } = req.body;
    const accountId = req.user?.accountId;
    const clientId = req.user?.clientId;
    const locationId = req.user?.defaultLocationId;

    if (!customerId) {
        throw new AppError("Customer ID is required", 400);
    }

    if (!locationId) {
        throw new AppError("Location is required", 400);
    }

    if (!inventoryProductIds || !Array.isArray(inventoryProductIds)) {
        throw new AppError("Inventory product IDs must be provided as an array", 400);
    }

    const hold = await holdService.createHold(
        { customerId, inventoryProductIds, description, fabricatorId },
        Number(accountId),
        Number(clientId),
        Number(locationId)
    );

    return SuccessResponse(res, 201, "Hold created successfully", hold);
});

/**
 * Get hold by ID
 */
export const getHoldById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const hold = await holdService.getHoldById(Number(id), clientId);

    return SuccessResponse(res, 200, "Hold fetched successfully", hold);
});

/**
 * Get all holds
 */
export const getAllHolds = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const accountId = req.user?.accountId;
    const { page = 1, limit = 10, productId } = req.query;

    if (!clientId || !accountId) {
        throw new AppError("Missing client or account information", 401);
    }

    const result = await holdService.getAllHolds(
        clientId,
        accountId,
        Number(page),
        Number(limit),
        productId ? Number(productId) : undefined
    );

    return SuccessResponse(res, 200, "Holds fetched successfully", result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
    });
});

/**
 * Delete hold
 */
export const deleteHold = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const result = await holdService.deleteHold(Number(id), clientId);

    return SuccessResponse(res, 200, "Hold deleted successfully", result);
});

/**
 * Delete hold item
 */
export const deleteHoldItem = catchAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const result = await holdService.deleteHoldItem(Number(itemId), clientId);

    return SuccessResponse(res, 200, "Hold item deleted successfully", result);
});

/**
 * Update hold item
 */
export const updateHoldItem = catchAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const clientId = req.user?.clientId;
    const { unitPrice } = req.body;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const result = await holdService.updateHoldItem(Number(itemId), clientId, { unitPrice: Number(unitPrice) });

    return SuccessResponse(res, 200, "Hold item updated successfully", result);
});

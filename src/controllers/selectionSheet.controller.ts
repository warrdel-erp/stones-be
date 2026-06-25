import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as selectionSheetService from "../services/selectionSheet.service";

/**
 * Create a new selection sheet
 */
export const createSelectionSheet = catchAsync(async (req: AuthRequest, res: Response) => {
    const { customerId, inventoryProductIds } = req.body;
    const accountId = req.user?.accountId;
    const clientId = req.user?.clientId;

    if (!customerId) {
        throw new AppError("Customer ID is required", 400);
    }

    if (!inventoryProductIds || !Array.isArray(inventoryProductIds)) {
        throw new AppError("Inventory product IDs must be provided as an array", 400);
    }

    const selectionSheet = await selectionSheetService.createSelectionSheet(
        { customerId, inventoryProductIds },
        Number(accountId),
        Number(clientId)
    );

    return SuccessResponse(res, 201, "Selection sheet created successfully", selectionSheet);
});

/**
 * Get selection sheet by ID
 */
export const getSelectionSheetById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const selectionSheet = await selectionSheetService.getSelectionSheetById(Number(id), clientId);

    return SuccessResponse(res, 200, "Selection sheet fetched successfully", selectionSheet);
});

/**
 * Get all selection sheets
 */
export const getAllSelectionSheets = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const accountId = req.user?.accountId;
    const { page = 1, limit = 10, productId, search } = req.query;

    if (!clientId || !accountId) {
        throw new AppError("Missing client or account information", 401);
    }

    const result = await selectionSheetService.getAllSelectionSheets(
        clientId,
        accountId,
        Number(page),
        Number(limit),
        productId ? Number(productId) : undefined,
        search as string
    );

    return SuccessResponse(res, 200, "Selection sheets fetched successfully", result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
    });
});

/**
 * Delete selection sheet
 */
export const deleteSelectionSheet = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const result = await selectionSheetService.deleteSelectionSheet(Number(id), clientId);

    return SuccessResponse(res, 200, "Selection sheet deleted successfully", result);
});

/**
 * Delete selection sheet item
 */
export const deleteSelectionSheetItem = catchAsync(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Missing client information", 401);
    }

    const result = await selectionSheetService.deleteSelectionSheetItem(Number(itemId), clientId);

    return SuccessResponse(res, 200, "Selection sheet item deleted successfully", result);
});


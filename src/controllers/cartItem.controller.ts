import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as cartItemService from "../services/cartItem.service";
import { CreateCartItemInput } from "../validators";

/**
 * Get cart items for the authenticated user
 * Returns products with their inventory products that are in cart
 */
export const getCartItems = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.accountId) {
        throw new AppError("User not authenticated or account ID missing", 401);
    }

    const cartItems = await cartItemService.getCartItemsByAccountId(req.user.accountId);

    return SuccessResponse(res, 200, "Cart items fetched successfully", cartItems);
});

/**
 * Create a new cart item
 */
export const createCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.accountId || !req.user.clientId) {
        throw new AppError("User not authenticated or missing required information", 401);
    }

    const data: CreateCartItemInput = req.body;

    const cartItem = await cartItemService.createCartItem(
        data.inventoryProductId,
        req.user.accountId,
        req.user.clientId
    );

    return SuccessResponse(res, 201, "Cart item created successfully", cartItem);
});

/**
 * Delete a cart item by ID
 */
export const deleteCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.accountId) {
        throw new AppError("User not authenticated or account ID missing", 401);
    }

    const cartItemId = Number(req.params.id);

    if (!cartItemId || isNaN(cartItemId)) {
        throw new AppError("Invalid cart item ID", 400);
    }

    await cartItemService.deleteCartItem(cartItemId, req.user.accountId);

    return SuccessResponse(res, 200, "Cart item deleted successfully", {});
});


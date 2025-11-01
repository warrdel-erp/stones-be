import * as cartItemRepository from "../repositories/cartItem.repository";
import { AppError } from "../helper/appError";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { Transaction } from "sequelize";

/**
 * Get cart items grouped by product for a given account
 * Returns products with their inventory products that are in cart
 */
export const getCartItemsByAccountId = async (accountId: number) => {
    return await cartItemRepository.getCartItemsByAccountId(accountId);
};

/**
 * Create a new cart item
 */
export const createCartItem = async (
    inventoryProductId: number,
    accountId: number,
    clientId: number
) => {
    // Validate that inventory product exists and belongs to the same client
    const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inventoryProductId)

    if (!inventoryProduct) {
        throw new AppError("Inventory product not found", 404);
    }

    if (inventoryProduct.clientId !== clientId) {
        throw new AppError("Inventory product does not belong to your client", 403);
    }

    // Going to cart item must be in inventory.
    if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
        throw new AppError("Inventory product is not in inventory", 400);
    }

    return await cartItemRepository.createCartItem({ accountId, inventoryProductId, clientId });
};

/**
 * Validate cart items for given inventory product IDs
 * Checks if cart items exist and belong to the specified accountId
 */
export const validateCartItemsByInventoryProductIds = async (
    inventoryProductIds: number[],
    accountId: number,
    transaction?: Transaction
) => {
    if (!inventoryProductIds || inventoryProductIds.length === 0) {
        return;
    }

    // Validate each cart item exists and belongs to the accountId
    for (const inventoryProductId of inventoryProductIds) {
        const cartItem: any = await cartItemRepository.findCartItemByInventoryProductId(
            inventoryProductId,
            transaction
        );

        if (cartItem && cartItem?.accountId !== accountId) {
            throw new AppError(
                `Cart item for inventory product ID: ${inventoryProductId} does not belong to your account`,
                403
            );
        }
    }
};

/**
 * Delete cart items for given inventory product IDs
 */
export const deleteCartItemsByInventoryProductIds = async (
    inventoryProductIds: number[],
    accountId: number,
    transaction?: Transaction
) => {
    if (!inventoryProductIds || inventoryProductIds.length === 0) {
        return;
    }

    await cartItemRepository.deleteCartItemsByInventoryProductIdsAndAccountId(
        inventoryProductIds,
        accountId,
        transaction
    );
};

/**
 * Delete a cart item by ID
 * Validates that the cart item exists and belongs to the accountId before deleting
 */
export const deleteCartItem = async (
    cartItemId: number,
    accountId: number
) => {
    // Validate cart item exists and belongs to the accountId
    const cartItem: any = await cartItemRepository.findCartItemById(cartItemId);

    if (!cartItem) {
        throw new AppError("Cart item not found", 404);
    }

    if (cartItem.accountId !== accountId) {
        throw new AppError("Cart item does not belong to your account", 403);
    }

    // Delete cart item after validation
    const deletedCount = await cartItemRepository.deleteCartItemByIdAndAccountId(
        cartItemId,
        accountId
    );

    if (deletedCount === 0) {
        throw new AppError("Failed to delete cart item", 500);
    }

    return { deleted: true };
};

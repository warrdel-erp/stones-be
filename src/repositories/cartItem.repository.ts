import { CartItem, Product } from "../models";
import { Transaction } from "sequelize";
import { AppError } from "../helper/appError";
import { scoped } from "../utils/scoped";

/**
 * Get cart items for a given accountId
 * Returns products with their inventory products that are in cart
 */
export const getCartItemsByAccountId = async (accountId: number) => {
    const productScoped = scoped(Product);
    return productScoped.findAll({
        attributes: ["id", 'name', "singleUnitPrice"],
        include: [
            {
                association: 'inventoryProducts',
                attributes: ['id', 'status', 'isSlabType', "combinedNumber"],
                required: true,
                include: [
                    {
                        association: 'cartItem',
                        where: { accountId },
                        attributes: ['id'],
                        required: true
                    },
                    {
                        association: 'slab',
                    },
                    {
                        association: 'genericProduct',
                    },
                    {
                        association: 'holdItem',
                    },
                    {
                        association: "bin",
                        include: [
                            {
                                association: 'warehouse',
                                attributes: ['id'],
                                include: [
                                    {
                                        association: 'location',
                                        attributes: ['id', 'locationName'],
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]

    })

};

/**
 * Create a new cart item
 */
export const createCartItem = async (
    data: { accountId: number; inventoryProductId: number; clientId: number },
    transaction?: Transaction
) => {
    // Check if cart item already exists for this inventory product
    const existingCartItem = await scoped(CartItem).findOne({
        where: { inventoryProductId: data.inventoryProductId },
        transaction,
    });

    if (existingCartItem) {
        throw new AppError("This inventory product is already in the cart", 400);
    }

    return await scoped(CartItem).create(data, { transaction });
};

/**
 * Find cart item by inventoryProductId
 */
export const findCartItemByInventoryProductId = async (
    inventoryProductId: number,
    transaction?: Transaction
) => {
    return await scoped(CartItem).findOne({
        where: { inventoryProductId },
        transaction,
    });
};

/**
 * Find cart item by ID
 */
export const findCartItemById = async (
    cartItemId: number,
    transaction?: Transaction
) => {
    return await CartItem.findByPk(cartItemId, { transaction });
};

/**
 * Delete cart item by ID and accountId
 * Only deletes if the cart item belongs to the specified accountId
 */
export const deleteCartItemByIdAndAccountId = async (
    cartItemId: number,
    accountId: number,
    transaction?: Transaction
) => {
    const deletedCount = await scoped(CartItem).destroy({
        where: {
            id: cartItemId,
            accountId: accountId,
        },
        transaction,
    });

    return deletedCount;
};

/**
 * Delete cart items by inventoryProductId and accountId
 * Only deletes if the cart item belongs to the specified accountId
 */
export const deleteCartItemsByInventoryProductIdsAndAccountId = async (
    inventoryProductIds: number[],
    accountId: number,
    transaction?: Transaction
) => {
    if (!inventoryProductIds || inventoryProductIds.length === 0) {
        return 0;
    }

    const deletedCount = await scoped(CartItem).destroy({
        where: {
            inventoryProductId: inventoryProductIds,
            accountId: accountId,
        },
        transaction,
    });

    return deletedCount;
};

/**
 * Get cart count for a given accountId
 * Returns the number of cart items belonging to the user
 */
export const getCartCountByAccountId = async (accountId: number) => {
    return await scoped(CartItem).count({
        where: {
            accountId: accountId,
        },
    });
};


import { Where } from "sequelize/types/utils";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as inventoryProductHoldRepository from "../repositories/inventoryProductHold.repository";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { getModels } from "sequelize-typescript";
import * as models from "../models";
import * as  genericProductRepository from "../repositories/genericProduct.repository"
import { scoped } from "../utils/scoped";
import * as slabRepository from "../repositories/slab.repository";

export const getInventoryProductsBySIPLCombinedNumber = async (siplId: number) => {
    // Get inventory products by matching the middle number in combinedNumber using repository
    const inventoryProducts = await inventoryProductRepository.getInventoryProductsBySIPL(siplId);

    return inventoryProducts;
};

export const updateInventoryProductsSellingPrice = async (ids: number[], sellingPrice: number) => {
    // Update selling price of multiple inventory products using repository
    const result = await inventoryProductRepository.updateInventoryProductsSellingPrice(ids, sellingPrice);

    return result;
};

export const getInventoryProductsBySlabField = async (fieldName: "lot" | "block", fieldValue: string) => {
    // Get inventory products by slab field filter using repository
    const inventoryProducts = await inventoryProductRepository.getInventoryProductsBySlabField(fieldName, fieldValue);

    return inventoryProducts;
};

export const getAllocatedInventoryProductsAccordingToCustomer = async (customerId: number) => {
    return await inventoryProductRepository.getAllocatedInventoryProductsAccordingToCustomer(customerId);
};

export const getAllocatedInventoryProductDetails = async (inventoryProductId: number) => {

    const data: any = await inventoryProductRepository.getAllocatedInventoryProductWithSalesOrderAndCustomer(inventoryProductId);

    if (!data) {
        throw new AppError("Allocated inventory product not found", 404);
    }

    data.salesOrderProduct = data.salesOrderProducts[0]

    delete data.salesOrderProducts;

    return data;
};

export const getInventoryProducts = (filter: Record<string, string>, locationId: number) => {
    return inventoryProductRepository.getInventoryProducts(filter, locationId)
}

export const getInventoryProductsPaginated = (filter: Record<string, any>, locationId: number, limit: number, offset: number) => {
    return inventoryProductRepository.getInventoryProductsPaginated(filter, locationId, limit, offset)
}

export const assignbinInventoryProducts = async (inventoryProduct: Array<{ id: number;[key: string]: any }>) => {
    if (!inventoryProduct || inventoryProduct.length === 0) return 0;

    const transaction = await sequelize.transaction(); // Explicitly start transaction
    let affectedRows = 0;

    try {
        for (const items of inventoryProduct) {
            const { id, binId, productType, ...updateFields } = items;

            if (!id) {
                throw new AppError("id is mandatory to all slabs to update.", 400);
            }

            // If binId is provided, update the corresponding inventory product
            if (binId !== undefined) {

                const intProduct: any = await models.InventoryProduct.findByPk(id, {
                    attributes: ['id'],
                    transaction
                });

                if (!intProduct) {
                    throw new AppError(`Slab with id ${id} not found`, 404);
                }

                const [updatedInventoryProduct] = await scoped(models.InventoryProduct).update(
                    { binId },
                    {
                        where: { id: intProduct.id },
                        transaction
                    }
                );
                affectedRows += updatedInventoryProduct
            }

        }

        await transaction.commit(); // Commit transaction if everything succeeds
        return affectedRows;
    } catch (error) {
        await transaction.rollback(); // Rollback transaction on error
        throw error; // Ensure the error is propagated
    }
};



export const updateInventoryProductCartStatus = async (id: number, isInCart: boolean) => {
    await inventoryProductRepository.updateInventoryProductCartStatus(id, isInCart);
    return { message: `Inventory Product ID ${id} cart status updated to ${isInCart}` };
};

/**
 * Create a hold on an inventory product
 */
export const holdInventoryProduct = async (
    inventoryProductId: number,
    data: { note: string | undefined, customerId?: number },
    accountId: number
) => {
    const transaction = await sequelize.transaction();

    try {
        // Check if inventory product exists
        const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inventoryProductId);

        if (!inventoryProduct) {
            throw new AppError("Inventory product not found", 404);
        }

        // Check if hold already exists
        const existingHold = await inventoryProductHoldRepository.findHoldByInventoryProductId(
            inventoryProductId,
            transaction
        );

        if (existingHold) {
            throw new AppError("Inventory product is already on hold", 400);
        }

        // Check if product is in valid status to be held
        if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
            throw new AppError(`Inventory product cannot be held. Current status: ${inventoryProduct.status}`, 400);
        }

        // Create hold record
        const hold = await inventoryProductHoldRepository.createHold(
            {
                ...data,
                inventoryProductId,
                createdById: accountId,
            },
            transaction
        );

        await transaction.commit();

        return hold;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Remove hold from an inventory product
 */
export const unholdInventoryProduct = async (inventoryProductId: number) => {
    const transaction = await sequelize.transaction();

    try {
        // Check if inventory product exists
        const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inventoryProductId);

        if (!inventoryProduct) {
            throw new AppError("Inventory product not found", 404);
        }

        // Delete hold record
        const deletedCount = await inventoryProductHoldRepository.deleteHoldByInventoryProductId(
            inventoryProductId,
            transaction
        );

        if (deletedCount === 0) {
            throw new AppError("Hold record not found. Inventory product is not on hold", 404);
        }

        await transaction.commit();

        return { message: "Hold removed successfully" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get hold details by hold ID
 */
export const getHoldById = async (holdId: number) => {
    const hold = await inventoryProductHoldRepository.findHoldById(holdId);

    if (!hold) {
        throw new AppError("Hold not found", 404);
    }

    return hold;
};

/**
 * Create multiple holds on inventory products with a given customerId
 */
export const createBulkHolds = async (
    inventoryProductIds: number[],
    customerId: number,
    data: { note?: string },
    accountId: number
) => {
    if (!Array.isArray(inventoryProductIds) || inventoryProductIds.length === 0) {
        throw new AppError("Inventory product IDs array is required and must not be empty", 400);
    }

    if (!customerId) {
        throw new AppError("Customer ID is required", 400);
    }

    const transaction = await sequelize.transaction();

    try {
        const holdsData: Array<{ inventoryProductId: number; note?: string; createdById: number; customerId: number }> = [];
        const errors: Array<{ inventoryProductId: number; error: string }> = [];

        // Validate each inventory product
        for (const inventoryProductId of inventoryProductIds) {
            // Check if inventory product exists
            const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inventoryProductId, transaction);

            if (!inventoryProduct) {
                errors.push({
                    inventoryProductId,
                    error: "Inventory product not found"
                });
                continue;
            }

            // Check if product is in valid status to be held
            if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
                errors.push({
                    inventoryProductId,
                    error: "Inventory product not in inventory."
                })

                continue;
            }

            // Check if hold already exists
            const existingHold = await inventoryProductHoldRepository.findHoldByInventoryProductId(
                inventoryProductId,
                transaction
            );

            if (existingHold) {
                errors.push({
                    inventoryProductId,
                    error: "Inventory product is already on hold"
                });
                continue;
            }

            // Check if product is in valid status to be held
            if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
                errors.push({
                    inventoryProductId,
                    error: `Inventory product cannot be held. Current status: ${inventoryProduct.status}`
                });
                continue;
            }

            // Add to holds data if all validations pass
            holdsData.push({
                inventoryProductId,
                note: data.note,
                createdById: accountId,
                customerId,
            });
        }

        // If there are errors, return them
        if (errors.length > 0) {
            // await transaction.rollback();
            throw new AppError("Some inventory products could not be placed on hold", 400, {
                errors,
                successfulCount: 0,
                failedCount: errors.length,
            });
        }

        // Create all holds
        const createdHolds = await inventoryProductHoldRepository.createBulkHolds(holdsData, transaction);

        await transaction.commit();

        return {
            holds: createdHolds,
            successfulCount: createdHolds.length,
            failedCount: 0,
        };
    } catch (error: any) {
        await transaction.rollback();

        // If it's already an AppError, rethrow it
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(error.message || "Failed to create bulk holds", 400);
    }
};


export const getInventoryProductsWithEmptyBin = async (productId?: number) => {
    return await inventoryProductRepository.getInventoryProductsWithEmptyBin(productId);
};

export const getInventoryProductByQrCode = async (qrCode: string) => {
    const data = await inventoryProductRepository.getInventoryProductByQrCode(qrCode);

    if (!data) {
        throw new AppError("Inventory product with this QR code not found", 404);
    }

    return data;
};



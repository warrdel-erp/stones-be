import { Where } from "sequelize/types/utils";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as inventoryProductHoldRepository from "../repositories/inventoryProductHold.repository";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { INVENTORY_ITEM_STATUS } from "../constants";

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


export const getInventoryProducts = (filter: Record<string, string>, locationId: number) => {
    return inventoryProductRepository.getInventoryProducts(filter, locationId)
}

export const updateInventoryProductCartStatus = async (id: number, isInCart: boolean) => {
    await inventoryProductRepository.updateInventoryProductCartStatus(id, isInCart);
    return { message: `Inventory Product ID ${id} cart status updated to ${isInCart}` };
};

/**
 * Create a hold on an inventory product
 */
export const holdInventoryProduct = async (
    inventoryProductId: number,
    note: string | undefined,
    userId: number
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
                inventoryProductId,
                note,
                createdById: userId,
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


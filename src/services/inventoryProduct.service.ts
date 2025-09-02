import { Where } from "sequelize/types/utils";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";

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


export const getInventoryProducts = (filter: Record<string, string>) => {
    return inventoryProductRepository.getInventoryProducts(filter)
}
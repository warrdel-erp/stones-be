import { col, fn, literal, Op, Transaction } from "sequelize";
import * as models from "../models";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { scoped } from "../utils/scoped";

// Create generic product
export const createGenericProduct = async (genericProductData: any, transaction?: Transaction) => {
    return await scoped(models.GenericProduct).bulkCreate(genericProductData, { transaction, individualHooks: true });
};

// Finds all generic products by SIPL ID and updates their status.
export const updateGenericProductStatusBySipl = async (siplId: number, transaction: Transaction): Promise<number> => {
    const [updatedCount] = await scoped(models.GenericProduct).update(
        { status: INVENTORY_ITEM_STATUS.IN_INVENTORY },
        { where: { siplId, status: INVENTORY_ITEM_STATUS.INITIATE }, individualHooks: true, transaction } // Only update generic products that are initiated
    );

    return updatedCount;
};

// Set unit landed cost for generic products by SIPL ID and product ID
export const setUnitLandedCost = async (
    siplId: number,
    productId: number,
    landedUnitCost: number,
    transaction: Transaction
): Promise<number> => {
    const [updatedCount] = await scoped(models.GenericProduct).update(
        { status: INVENTORY_ITEM_STATUS.IN_INVENTORY, landedUnitCost },
        { where: { siplId, productId }, individualHooks: true, transaction } // Update generic products status to IN_INVENTORY
    );

    return updatedCount;
};

// Update the status of a Generic Product based on inventoryProductId.
export const updateGenericProductStatusByInventoryProduct = async (
    inventoryProductId: number,
    status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
    transaction?: Transaction,
    additionalObj?: any
) => {
    // Find the related generic product
    const genericProduct = await scoped(models.GenericProduct).findOne({
        where: { inventoryProductId },
        transaction,
    });

    if (!genericProduct) {
        return null; // No generic product found for this inventoryProductId
    }

    // Update the status
    await scoped(models.GenericProduct).update({ status, ...additionalObj }, { where: { inventoryProductId }, individualHooks: true, transaction });

    return genericProduct;
};

// Create generic product
export const getGenericProductByInventoryProductId = async (inventoryProductId: number, transaction?: Transaction) => {
    return await scoped(models.GenericProduct).findOne({ where: { inventoryProductId }, transaction });
};

export const countBySiplProductId = async (siplProductId: number) => {
    return await scoped(models.GenericProduct).count({ where: { siplProductId } });
};

// Get all generic products
export const getAllGenericProducts = async (filters?: any, transaction?: Transaction, locationId?: number) => {
    return await scoped(models.GenericProduct).findAll({
        where: filters,
        include: [
            {
                association: "product",
            },
            {
                association: "sipl",
                attributes: ["id", "invoiceCode"],
                include: [
                    {
                        association: "purchaseOrder",
                        attributes: ["id"],
                    },
                ],
            },
            {
                association: "inventoryProduct",
                include: [
                    {
                        association: "bin",
                        required: true,
                        include: [
                            {
                                association: "warehouse",
                                where: { ...(locationId ? { locationId } : {}) },
                                required: true,
                                include: [
                                    {
                                        association: "location",
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ],
        transaction
    });
};


// Get data
export const getAvailableGenericProductData = async (productId: number) => {
    const data = await scoped(models.GenericProduct).findAll({
        where: {
            productId,
            [Op.and]: [{ status: INVENTORY_ITEM_STATUS.IN_INVENTORY }, { isHold: false }],
        },
        attributes: [
            [fn("COUNT", col("id")), "count"],
        ],
    });

    return data;
};


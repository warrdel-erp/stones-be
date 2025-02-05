import { Sequelize } from "sequelize";
import poSlabDetailModel from "../models/poSlabDetailModel.js";

export async function slabsCount(productId) {
    // total slabs without SOLD status.
    // total slabs with ALLOCATED & HOLD status.
    // total slabs without ALLOCATED & HOLD & SOLD.

    try {
        const result = await poSlabDetailModel.findOne({
            attributes: [
                [
                    Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN status NOT IN ('SOLD') THEN 1 END`)),
                    'inStock'
                ],
                [
                    Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN status IN ('ALLOCATED', 'HOLD') THEN 1 END`)),
                    'hold-allocated'
                ],
                [
                    Sequelize.fn('COUNT', Sequelize.literal(`CASE WHEN status NOT IN ('ALLOCATED', 'HOLD', 'SOLD') THEN 1 END`)),
                    'available'
                ],
            ],
            where: {
                ...(productId && { productId })
            }
        });
        return result;
    } catch (error) {
        console.error("Error in addProduct:", error);
        throw error;
    }
}
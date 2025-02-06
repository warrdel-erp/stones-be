import { Op, Sequelize } from "sequelize";
import poSlabDetailModel from "../models/poSlabDetailModel.js";

export async function inventoryBalance(productId) {
    // total slabs without SOLD status.
    // total slabs with ALLOCATED & HOLD status.
    // total slabs without ALLOCATED & HOLD & SOLD.

    try {

        const inStock = await poSlabDetailModel.findAndCountAll({
            where: {
                status: {
                    [Op.notIn]: ["SOLD"],
                },
                productId

            },
            attributes: [
                [Sequelize.fn("SUM", Sequelize.literal("`receving_length` * `receving_width`/ 144")), "totalArea"]
            ]
        })

        const holdAllocated = await poSlabDetailModel.findAndCountAll({
            where: {
                status: {
                    [Op.in]: ['ALLOCATED', 'HOLD'],
                },
                productId

            },
            attributes: [
                [Sequelize.fn("SUM", Sequelize.literal("`receving_length` * `receving_width`/ 144")), "totalArea"]
            ]
        })

        const available = await poSlabDetailModel.findAndCountAll({
            where: {
                status: {
                    [Op.notIn]: ['ALLOCATED', 'HOLD', 'SOLD'],
                },
                productId

            },
            attributes: [
                [Sequelize.fn("SUM", Sequelize.literal("`receving_length` * `receving_width`/ 144")), "totalArea"]
            ]
        })

        return {
            inStock: {
                count: inStock.count,
                totalAreaSF: inStock.rows[0]?.dataValues?.totalArea
            },
            holdAllocated: {
                count: holdAllocated.count,
                totalAreaSF: holdAllocated.rows[0]?.dataValues?.totalArea
            },
            available: {
                count: available.count,
                totalAreaSF: available.rows[0]?.dataValues?.totalArea
            }
        };
    } catch (error) {
        console.error("Error in addProduct:", error);
        throw error;
    }
}

import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as genericProductRepository from "../repositories/genericProduct.repository";
import * as models from "../models";
import { isSIPLLocked } from "../helper";
import { scoped } from "../utils/scoped";
import * as inventoryProductService from "./inventoryProduct.service";

// Get all generic products
export const fetchAllGenericProducts = async (filters?: any, transaction?: Transaction, locationId?: number) => {
    return await genericProductRepository.getAllGenericProducts(filters, transaction, locationId);
};

export const deleteGenericProduct = async (genericProductId: number) => {
    const transaction = await sequelize.transaction();

    try {
        const genericProduct: any = await models.GenericProduct.findByPk(genericProductId, {
            include: [
                { model: models.SIPL, as: 'sipl' },
                { model: models.InventoryProduct, as: 'inventoryProduct' }
            ],
            transaction
        });

        if (!genericProduct) {
            throw new AppError("Generic product not found", 404);
        }

        if (isSIPLLocked(genericProduct.sipl)) {
            throw new AppError("Generic product cannot be deleted as the SIPL is locked (received or canceled)", 400);
        }

        const { inventoryProductId, siplId } = genericProduct;

        if (inventoryProductId) {
            const newerInvProd = await scoped(models.InventoryProduct).findOne({
                where: {
                    siplId,
                    id: { [Op.gt]: inventoryProductId }
                },
                transaction
            });

            if (newerInvProd) {
                throw new AppError("Only the last created inventory product for this SIPL can be deleted", 400);
            }

            await inventoryProductService.checkTiedToPublishedQuotation(inventoryProductId, transaction);

            await models.InventoryProductImage.destroy({
                where: { inventoryProductId },
                transaction
            });
        }

        await scoped(models.GenericProduct).destroy({
            where: { id: genericProductId },
            transaction
        });

        if (inventoryProductId) {
            await scoped(models.InventoryProduct).destroy({
                where: { id: inventoryProductId },
                transaction
            });
        }

        await transaction.commit();
        return { success: true, message: "Generic product deleted successfully" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
 
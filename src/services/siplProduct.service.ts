import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { isSIPLLocked } from "../helper";
import * as models from "../models";
import * as siplProductsRepository from "../repositories/siplProducts.repository";
import { scoped } from "../utils/scoped";

// Delete requested purchase product
export const deleteRequestedPurchaseProduct = async (id: number) => {
  const product = await siplProductsRepository.findOne({ id });

  if (!product) {
    throw new Error("SIPL product not found");
  }

  const data = await siplProductsRepository.deleteProductById(id);

  return data;
};

export const deleteAllSlabsForSiplProduct = async (siplProductId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const siplProduct: any = await models.SIPLProduct.findByPk(siplProductId, {
      include: [{ model: models.SIPL, as: 'sipl' }],
      transaction
    });

    if (!siplProduct) {
      throw new AppError("SIPL product not found", 404);
    }

    if (isSIPLLocked(siplProduct.sipl)) {
      throw new AppError("Items cannot be deleted as the SIPL is locked (received or canceled)", 400);
    }

    const slabs = await scoped(models.Slab).findAll({ where: { siplProductId }, transaction });
    const genericProducts = await scoped(models.GenericProduct).findAll({ where: { siplProductId }, transaction });

    const slabIds = slabs.map((s: any) => s.id);
    const genericProductIds = genericProducts.map((g: any) => g.id);
    const inventoryProductIds = [
      ...slabs.map((s: any) => s.inventoryProductId),
      ...genericProducts.map((g: any) => g.inventoryProductId)
    ].filter(Boolean);

    if (inventoryProductIds.length === 0) {
      await transaction.commit();
      return { success: true, message: "No items to delete" };
    }

    // Check if any newer InventoryProduct exists for this SIPL in another product
    const maxInvProdId = Math.max(...inventoryProductIds);
    const newerInvProd = await scoped(models.InventoryProduct).findOne({
      where: {
        siplId: siplProduct.siplId,
        id: { [Op.gt]: maxInvProdId }
      },
      transaction
    });

    if (newerInvProd) {
      throw new AppError("Only the latest added items in the SIPL can be deleted to preserve sequential serial numbers", 400);
    }

    if (slabIds.length > 0) {
      await scoped(models.SlabRemeasurement).destroy({
        where: { slabId: { [Op.in]: slabIds } },
        transaction
      });
    }

    await models.InventoryProductImage.destroy({
      where: { inventoryProductId: { [Op.in]: inventoryProductIds } },
      transaction
    });

    if (slabIds.length > 0) {
      await scoped(models.Slab).destroy({
        where: { id: { [Op.in]: slabIds } },
        transaction
      });
    }

    if (genericProductIds.length > 0) {
      await scoped(models.GenericProduct).destroy({
        where: { id: { [Op.in]: genericProductIds } },
        transaction
      });
    }

    await scoped(models.InventoryProduct).destroy({
      where: { id: { [Op.in]: inventoryProductIds } },
      transaction
    });

    await transaction.commit();
    return { success: true, message: "All items deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Find Sipl Product By Product Id
export const findSiplProductByProductId = async (siplProductId: number, productId: number, siplId: number) => {
  return await siplProductsRepository.findByProductIdAndSiplId(siplProductId, productId, siplId);
};

export const fetchTotalSIPLProductAmount = async (
  fromDate: string,
  toDate: string,
  clientId: number,
) => {
  return await siplProductsRepository.getTotalSIPLProductAmountBetweenDates(fromDate, toDate, clientId);
};

export const getTotalSIPLProductValueByClient = async (clientId: number) => {
  return await siplProductsRepository.getTotalSIPLProductValueByClient(clientId);
}


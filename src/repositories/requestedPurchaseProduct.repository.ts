import { FindOptions, Sequelize, Transaction, WhereOptions } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import { scoped } from "../utils/scoped";

// find product by id
export const findById = async (id: number, transaction?: Transaction) => {
  return (
    await models.RequestedPurchaseProduct.findByPk(id, {
      include: [
        {
          model: models.SIPLProduct,
          as: "siplProducts",
        },
      ],
      transaction,
    })
  )?.get({ plain: true });
};

// find product by id
export const findByIdAndPurchaseOrderId = async (id: number, purchaseOrderId: number, transaction?: Transaction) => {
  return await scoped(models.RequestedPurchaseProduct).findOne({ where: { id, purchaseOrderId }, transaction });
};

// find product by id
export const findByFilters = async (filter: WhereOptions) => {
  return await scoped(models.RequestedPurchaseProduct).findAll({ where: filter || {} });
};

// Get updated product
export const updateProduct = async (id: number, data: any) => {
  return await scoped(models.RequestedPurchaseProduct).update(data, { where: { id }, individualHooks: true });
};

// Create new product
export const createProduct = async (data: any) => {
  return await scoped(models.RequestedPurchaseProduct).create(data);
};

// Delete product by id
export const deleteProductById = async (id: number) => {
  return await scoped(models.RequestedPurchaseProduct).destroy({ where: { id } });
};

export const deleteRequestedProductsByPurchaseOrderId = async (purchaseOrderId: number, transaction?: Transaction) => {
  return await scoped(models.RequestedPurchaseProduct).destroy({ where: { purchaseOrderId }, transaction });
};

export const getTotalQuantityByPurchaseOrder = async (purchaseOrderId: number) => {
  const totalQuantity = await models.RequestedPurchaseProduct.sum("quantity", {
    where: { purchaseOrderId },
  });

  return totalQuantity || 0; // If no records, return 0
};

export const getTotalQuantityByPurchaseOrderAndProduct = async (purchaseOrderId: number, productId: number) => {
  const totalQuantity = await models.RequestedPurchaseProduct.sum("quantity", {
    where: { purchaseOrderId, productId },
  } as FindOptions);

  return totalQuantity || 0; // If no records, return 0
};

export const getTotalQuantityForAllPOs = async () => {
  const totalQuantities = await scoped(models.RequestedPurchaseProduct).findAll({
    attributes: ["purchaseOrderId", [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"]],
    group: ["purchaseOrderId"], // Group by PO ID
    raw: true,
  });

  return totalQuantities; // Returns an array [{ purchaseOrderId: 1, totalQuantity: 50 }, { purchaseOrderId: 2, totalQuantity: 30 }]
};

import { Sequelize, WhereOptions } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";

// find product by id
export const findById = async (id: number) => {
  return await models.RequestedPurchaseProduct.findByPk(id);
};

// find product by id
export const findByFilters = async (filter: WhereOptions) => {
  return await models.RequestedPurchaseProduct.findAll({ where: filter || {} });
};

// Get updated product
export const updateProduct = async (id: number, data: any) => {
  return await models.RequestedPurchaseProduct.update(data, { where: { id }, individualHooks: true });
};

// Create new product
export const createProduct = async (data: any) => {
  return await models.RequestedPurchaseProduct.create(data);
};

// Delete product by id
export const deleteProductById = async (id: number) => {
  return await models.RequestedPurchaseProduct.destroy({ where: { id } });
};

export const getTotalQuantityByPurchaseOrder = async (purchaseOrderId: number) => {
  const totalQuantity = await models.RequestedPurchaseProduct.sum("quantity", {
    where: { purchaseOrderId },
  });

  return totalQuantity || 0; // If no records, return 0
};

export const getTotalQuantityForAllPOs = async () => {
  const totalQuantities = await models.RequestedPurchaseProduct.findAll({
    attributes: ["purchaseOrderId", [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"]],
    group: ["purchaseOrderId"], // Group by PO ID
    raw: true,
  });

  return totalQuantities; // Returns an array [{ purchaseOrderId: 1, totalQuantity: 50 }, { purchaseOrderId: 2, totalQuantity: 30 }]
};

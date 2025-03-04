import { Transaction } from "sequelize";
import * as models from "../models";

//  Find LoadingOrderProduct by Id and loading order Id.
export const findByIdAndLoadingOrderId = async (
  { id, loadingOrderId }: { id: number; loadingOrderId: number },
  transaction?: Transaction
) => {
  return models.LoadingOrderProduct.findOne({ where: { id, loadingOrderId }, transaction });
};

// Create a new LoadingOrderProduct entry.
export const createLoadingOrderProduct = async (productData: any, transaction?: Transaction) => {
  return models.LoadingOrderProduct.create(productData, { transaction });
};

// Update an existing LoadingOrderProduct entry.
export const updateLoadingOrderProduct = async (id: number, updateData: any, transaction?: Transaction) => {
  return models.LoadingOrderProduct.update(updateData, {
    where: { id },
    individualHooks: true,
    transaction,
  });
};

// Get all LoadingOrderProducts by loadingOrderId
export const getLoadingOrderProductsByLoadingOrderId = async (loadingOrderId: number) => {
  return await models.LoadingOrderProduct.findAll({
    where: { loadingOrderId },
    include: [
      {
        model: models.InventoryProduct,
        as: "inventoryProduct", // Ensures inventory product details are fetched
      },
    ],
  });
};

//  Find SalesOrderProduct by ID and loadingOrder.
export const findByInventoryProductIdAndLoadingOrder = async (
  { inventoryProductId, loadingOrderId }: { inventoryProductId: number; loadingOrderId: number },
  transaction?: Transaction
) => {
  return models.LoadingOrderProduct.findOne({ where: { inventoryProductId, loadingOrderId }, transaction });
};

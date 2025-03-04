import { Transaction } from "sequelize";
import * as models from "../models";

//  Find SalesOrderProduct by ID and salesOrderId.
export const findByIdAndSalesOrderId = async (
  { id, salesOrderId }: { id: number; salesOrderId: number },
  transaction?: Transaction
) => {
  return models.SalesOrderProduct.findOne({ where: { id, salesOrderId }, transaction });
};

//  Find SalesOrderProduct by ID and salesOrderId.
export const findByInventoryProductIdAndSalesOrderId = async (
  { inventoryProductId, salesOrderId }: { inventoryProductId: number; salesOrderId: number },
  transaction?: Transaction
) => {
  return models.SalesOrderProduct.findOne({ where: { inventoryProductId, salesOrderId }, transaction });
};

// Create a new SalesOrderProduct entry.
export const createSalesOrderProduct = async (productData: any, transaction?: Transaction) => {
  return models.SalesOrderProduct.create(productData, { transaction });
};

// Update an existing SalesOrderProduct entry.
export const updateSalesOrderProduct = async (id: number, updateData: any, transaction?: Transaction) => {
  return models.SalesOrderProduct.update(updateData, {
    where: { id },
    individualHooks: true,
    transaction,
  });
};

// Get all SalesOrderProduct by salesOrderId
export const getSalesOrderProductsBySalesOrderId = async (salesOrderId: number) => {
  return await models.SalesOrderProduct.findAll({
    where: { salesOrderId },
    include: [
      {
        model: models.InventoryProduct,
        as: "inventoryProduct", // Ensures inventory product details are fetched
      },
    ],
  });
};

import { Transaction } from "sequelize";
import * as models from "../models";

//  Find PackagingListProduct by Id and packaging list Id.
export const findByIdAndPackagingListId = async (
  { id, packagingListId }: { id: number; packagingListId: number },
  transaction?: Transaction
) => {
  return models.PackagingListProduct.findOne({ where: { id, packagingListId }, transaction });
};

// Create a new PackagingListProduct entry.
export const createPackagingListProduct = async (productData: any, transaction?: Transaction) => {
  return models.PackagingListProduct.create(productData, { transaction });
};

// Update an existing PackagingListProduct entry.
export const updatePackagingListProduct = async (id: number, updateData: any, transaction?: Transaction) => {
  return models.PackagingListProduct.update(updateData, {
    where: { id },
    individualHooks: true,
    transaction,
  });
};

// Get all PackagingListProducts by packagingListId
export const getByPackagingListId = async (packagingListId: number) => {
  return await models.PackagingListProduct.findAll({
    where: { packagingListId },
    include: [
      {
        model: models.InventoryProduct,
        as: "inventoryProduct", // Ensures inventory product details are fetched
      },
    ],
  });
};

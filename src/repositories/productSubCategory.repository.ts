import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createProductSubCategory = async (payload: any) => {
  return await scoped(models.ProductSubCategory).create(payload);
};

export const getAllProductSubCategories = async (clientId: number) => {
  return await models.ProductSubCategory.findAll({
    where: { clientId }
  });
};

export const getProductSubCategoryById = async (id: number, clientId: number) => {
  return await models.ProductSubCategory.findOne({
    where: { id, clientId },
  });
};

export const updateProductSubCategory = async (id: number, data: any) => {
  return await models.ProductSubCategory.update(data, { where: { id } });
};

// This function deletes a product subcategory by its ID and checks if it belongs to the specified client
export const deleteProductSubCategory = async (id: number, clientId: number) => {
  const subCategory = await models.ProductSubCategory.findOne({
    where: { id, clientId },
  });

  if (subCategory) {
    return await models.ProductSubCategory.destroy({ where: { id } });
  }

  return 0; // No rows deleted
};

import * as models from "../models";
import { scoped } from "../utils/scoped";
import { Op } from "sequelize";
// export const createProductSubCategory = async (payload: any) => {
//   return await scoped(models.ProductSubCategory).create(payload);
// };
export const createProductSubCategory = async (payload: any) => {

  const existing = await scoped(models.ProductSubCategory).findOne({
    where: {
      name: payload.name,
      clientId: payload.clientId,
    },
  });

  if (existing) {
    throw new Error("Subcategory already exists for this client");
  }

  return await scoped(models.ProductSubCategory).create(payload);
};

export const getAllProductSubCategories = async (clientId: number) => {
  return await scoped(models.ProductSubCategory).findAll({
    where: { clientId }
  });
};

export const getProductSubCategoryById = async (id: number, clientId: number) => {
  return await scoped(models.ProductSubCategory).findOne({
    where: { id, clientId },
  });
};

// old
// export const updateProductSubCategory = async (id: number, data: any) => {
//   return await scoped(models.ProductSubCategory).update(data, { where: { id } });
// };
// new
export const updateProductSubCategory = async (id: number, data: any) => {

  const existing = await scoped(models.ProductSubCategory).findOne({
    where: {
      name: data.name,
      clientId: data.clientId,
      id: { [Op.ne]: id },
    },
  });

  if (existing) {
    throw new Error("Subcategory already exists for this client");
  }

  return await scoped(models.ProductSubCategory).update(data, {
    where: { id },
  });
};

// This function deletes a product subcategory by its ID and checks if it belongs to the specified client
export const deleteProductSubCategory = async (id: number, clientId: number) => {
  const subCategory = await scoped(models.ProductSubCategory).findOne({
    where: { id, clientId },
  });

  if (subCategory) {
    return await scoped(models.ProductSubCategory).destroy({ where: { id } });
  }

  return 0; // No rows deleted
};

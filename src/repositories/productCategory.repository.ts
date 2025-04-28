import * as models from "../models";

export const createProductCategory = async (payload: any) => {
  return await models.ProductCategory.create(payload);
};

export const getAllProductCategories = async (clientId: number) => {
  return await models.ProductCategory.findAll({ where: { clientId } });
};

export const getProductCategoryById = async (id: number, clientId: number) => {
  return await models.ProductCategory.findOne({ where: { id, clientId } });
};

export const updateProductCategory = async (id: number, data: any) => {
  return await models.ProductCategory.update(data, { where: { id } });
};

export const deleteProductCategory = async (id: number, clientId: number) => {
  return await models.ProductCategory.destroy({ where: { id, clientId } });
};
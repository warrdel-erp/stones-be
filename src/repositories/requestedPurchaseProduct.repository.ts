import * as models from "../models";

// find product by id
export const findById = async (id: number) => {
  return await models.RequestedPurchaseProduct.findByPk(id);
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

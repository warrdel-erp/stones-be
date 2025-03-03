import * as models from "../models";

export const findById = async (id: number) => {
  return await models.RequestedPurchaseProduct.findByPk(id);
};

export const updateProduct = async (id: number, data: any) => {
  return await models.RequestedPurchaseProduct.update(data, { where: { id }, individualHooks: true });
};

export const createProduct = async (data: any) => {
  return await models.RequestedPurchaseProduct.create(data);
};

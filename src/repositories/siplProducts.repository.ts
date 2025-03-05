import { Transaction } from "sequelize";
import * as models from "../models";

export const createBulkSIPLProducts = async (data: any, transaction: Transaction) => {
  return await models.SIPLProduct.bulkCreate(data, { transaction });
};

// find product by id
export const findById = async (id: number) => {
  return await models.SIPLProduct.findByPk(id);
};

// Delete product by id
export const deleteProductById = async (id: number) => {
  return await models.SIPLProduct.destroy({ where: { id } });
};

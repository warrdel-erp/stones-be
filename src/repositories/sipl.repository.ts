import { Transaction } from "sequelize";
import * as models from "../models";

// Create SIPL
export async function createSIPL(siplData: any, transaction?: Transaction) {
  return await models.SIPL.create(siplData, { transaction });
}

// create SIPL Product
export async function createSIPLProducts(products: any[], siplId: number, transaction?: Transaction) {
  const productsWithSIPLId = products.map((product) => ({
    ...product,
    siplId,
  }));

  return await models.SIPLProduct.bulkCreate(productsWithSIPLId, { transaction });
}

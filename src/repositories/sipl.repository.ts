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

// Get latest invoice number
export const getInvoiceNumber = async () => {
  let lastPO: any = await models.SIPL.findOne({
    order: [["id", "DESC"]],
    attributes: ["clientInvoiceNumber", "poInvoiceNumber"],
  });

  lastPO = lastPO?.get({ plain: true });

  return {
    clientInvoiceNumber: lastPO.clientInvoiceNumber ? lastPO?.clientInvoiceNumber + 1 : 1,
    poInvoiceNumber: lastPO.poInvoiceNumber ? lastPO?.poInvoiceNumber + 1 : 1,
  };
};

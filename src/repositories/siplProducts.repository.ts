import { FindOptions, Transaction } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";

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

export const getTotalQuantityByPurchaseOrder = async (purchaseOrderId: number) => {
  const totalQuantity = await models.SIPLProduct.sum("quantity", {
    include: [
      {
        model: models.SIPL,
        as: "sipl",
        where: { purchaseOrderId },
        attributes: [],
      },
    ],
    raw: true,
    subQuery: false,
  } as FindOptions);

  return totalQuantity || 0; // Return 0 if no records found
};

export const getTotalQuantityForAllPO = async () => {
  const totalQuantity = await models.SIPLProduct.findAll({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("sipl_products.quantity")), "totalQuantity"],
      "sipl.purchaseOrderId",
    ],
    include: [
      {
        model: models.SIPL,
        as: "sipl",
        attributes: [],
      },
    ],
    group: ["sipl.purchaseOrderId"],
    raw: true,
  });

  return totalQuantity;
};

import { FindOptions, fn, literal, Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";

export const createBulkSIPLProducts = async (data: any, transaction: Transaction) => {
  return await models.SIPLProduct.bulkCreate(data, { transaction });
};

// find product by id
export const findOne = async (filter: WhereOptions) => {
  return await models.SIPLProduct.findOne({ where: filter });
};

export const findByProductIdAndSiplId = async (siplProductId: number, productId: number, siplId: number) => {
  const result = await models.SIPLProduct.findOne({
    where: {
      id: siplProductId,
      siplId,
    },
    include: [
      {
        model: models.RequestedPurchaseProduct,
        as: "requestedPurchaseProduct",
        where: {
          productId,
        },
        required: true,
      },
    ],
  });

  return result;
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

export const getTotalQuantityByProductAndPO = async (productId: number, purchaseOrderId: number) => {
  const totalQuantity = await models.SIPLProduct.sum("quantity", {
    where: { productId },
    include: [
      {
        model: models.SIPL,
        as: "sipl",
        where: { purchaseOrderId },
        attributes: [],
      },
    ],
    group: ["productId"],
    raw: true,
    // subQuery: false,
  } as FindOptions);

  return totalQuantity || 0; // Return 0 if no records found
};

export const getTotalSIPLProductAmountBetweenDates = async (
  fromDate: string,
  toDate: string,
  clientId: number
) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const result = await models.SIPLProduct.findOne({
    where: {
      createdAt: {
        [Op.between]: [from, to],
      },
    },
    include: [
      {
        model: models.SIPL,
        as: "sipl",
        where: {
          clientId,
        },
        required: true,
      },
    ],
    attributes: [[fn("SUM", literal("unitPrice * quantity")), "totalAmount"]],
    group: ["sipl.id"],
  });

  return Number(result?.dataValues?.totalAmount) || 0;
};

export const getTotalSIPLProductValueByClient = async (clientId: number) => {
  const result = await models.SIPLProduct.findOne({
    include: [
      {
        model: models.SIPL,
        as: "sipl",
        where: {
          clientId,
        },
        required: true,
      },
    ],
    attributes: [[fn("SUM", literal("quantity * unitPrice")), "totalValue"]],
    group: ["sipl_products.id"],
  });

  return Number(result?.dataValues?.totalValue) || 0;
};
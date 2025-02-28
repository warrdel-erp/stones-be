import PurchaseOrder from "../models/purchaseOrder";
import { Op, Sequelize, Transaction } from "sequelize";
import * as models from "../models";

/**
 * Create a new Purchase Order in the database.
 */
export const createPurchaseOrder = async (poData: any, transaction?: Transaction) => {
  return await PurchaseOrder.create(poData, { transaction });
};

// create SIPL Product
export async function createRequestedPurchaseProducts(
  products: any[],
  purchaseOrderId: number,
  transaction?: Transaction
) {
  const productsWithPoId = products.map((product) => ({
    ...product,
    purchaseOrderId,
  }));

  return await models.RequestedPurchaseProduct.bulkCreate(productsWithPoId, { transaction });
}

// Create freight Details
export async function createFreightDetail(
  freightData: any,
  { purchaseOrderId, siplId }: { purchaseOrderId?: number; siplId?: number },
  transaction?: Transaction
) {
  return await models.FreightDetail.create({ ...freightData, siplId, purchaseOrderId }, { transaction });
}

// Get po with pagination
export const getAllPurchaseOrders = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  return await PurchaseOrder.findAndCountAll({
    include: [{ model: models.Vendor, as: "supplier", attributes: ["name"] }],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

// get Total quantity as per PO.
export const getTotalQuantityPerPO = async () => {
  const result = await PurchaseOrder.findAll({
    attributes: [
      "id",
      [
        Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("requestedPurchaseProducts.quantity")), 0),
        "totalQuantity",
      ],
    ],
    include: [
      {
        model: models.RequestedPurchaseProduct,
        attributes: [],
        as: "requestedPurchaseProducts",
      },
    ],
    group: ["PurchaseOrder.id"],
    raw: true,
  });

  return result;
};

export const getPurchaseOrderById = async (id: number) => {
  const result = await PurchaseOrder.findOne({
    include: [
      { model: models.Vendor, as: "supplier" },
      { model: models.RequestedPurchaseProduct, as: "requestedPurchaseProducts" },
      {
        model: models.SIPL,
        as: "sipls",
        include: [
          { model: models.SIPLProduct, as: "siplProducts", include: [{ model: models.Product, as: "product" }] },
        ],
      },
    ],
    where: { id },
  });

  return result;
};

export const getTotalQuantityForPO = async (id: number) => {
  let result: any = await models.RequestedPurchaseProduct.findOne({
    attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("quantity")), 0), "totalQuantity"]],
    where: { purchaseOrderId: id },
    raw: true,
  });

  console.log(result);

  return result?.totalQuantity || 0;
};

// get SIPLs for a PO.
export const getSIPLsByPurchaseOrderId = async (purchaseOrderId: number) => {
  return await models.SIPL.findAll({
    where: { purchaseOrderId },
    raw: true,
    nest: true,
  });
};

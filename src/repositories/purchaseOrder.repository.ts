import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";

/**
 * Create a new Purchase Order in the database.
 */
export const createPurchaseOrder = async (poData: any, transaction?: Transaction) => {
  return await models.PurchaseOrder.create(poData, { transaction, hooks: true });
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
export const getAllPurchaseOrders = async (page: number, limit: number, filter?: WhereOptions) => {
  const offset = (page - 1) * limit;

  return await models.PurchaseOrder.findAndCountAll({
    where: filter,
    include: [{ model: models.Vendor, as: "supplier", attributes: ["name"] }],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

// Get PO detail by ID
export const getPurchaseOrderById = async (id: number) => {
  let result = await models.PurchaseOrder.findOne({
    include: [
      { model: models.Vendor, as: "supplier" },
      {
        model: models.RequestedPurchaseProduct,
        as: "requestedPurchaseProducts",
        include: [{ model: models.SIPLProduct, as: "siplProducts" }],
      },
      {
        model: models.SIPL,
        as: "sipls",
      },
      {
        model: models.FreightDetail,
        as: "freightDetail",
      },
    ],
    where: { id },
  });

  result = result?.get({ plain: true });
  return result;
};

// get SIPLs for a PO.
export const getSIPLsByPurchaseOrderId = async (purchaseOrderId: number) => {
  return await models.SIPL.findAll({
    where: { purchaseOrderId },
    raw: true,
    nest: true,
  });
};

// Get latest PO number
export const getPoNumber = async (clientId: number) => {
  const lastPO: any = await models.PurchaseOrder.findOne({
    where: { clientId },
    order: [["clientPoNumber", "DESC"]],
    attributes: ["clientPoNumber"],
  });

  return { clientPoNumber: lastPO ? lastPO?.clientPoNumber + 1 : 1 };
};

export async function updatePurchaseOrderStatus(purchaseOrderId: number, status: string, transaction?: any) {
  return await models.PurchaseOrder.update(
    { status },
    { where: { id: purchaseOrderId }, transaction, returning: true }
  );
}

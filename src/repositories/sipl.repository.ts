import { Sequelize, Transaction, where } from "sequelize";
import * as models from "../models";

// Create SIPL
export async function createSIPL(siplData: any, transaction?: Transaction) {
  return await models.SIPL.create(siplData, { transaction });
}

// Get latest invoice number
export const getInvoiceNumber = async () => {
  let lastPO: any = await models.SIPL.findOne({
    order: [["id", "DESC"]],
    attributes: ["clientInvoiceNumber", "poSiplNumber"],
  });

  lastPO = lastPO?.get({ plain: true });

  return {
    clientInvoiceNumber: lastPO ? lastPO?.clientInvoiceNumber + 1 : 1,
    poSiplNumber: lastPO ? lastPO?.poSiplNumber + 1 : 1,
  };
};

// Get SIPL by ID with less data
export const findSIPLByIdSimple = async (id: number) => {
  return await models.SIPL.findByPk(id);
};

// Get SIPL by ID
export const findSIPLById = async (id: number) => {
  return await models.SIPL.findByPk(id, {
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        include: [
          {
            model: models.FreightDetail,
            as: "freightDetail",
          },
        ],
      },
      {
        model: models.FreightDetail,
        as: "freightDetail",
      },
      {
        model: models.Bill,
        where: { type: "freight" },
        as: "bills",
        required: false,
        include: [
          {
            model: models.BillItem,
            as: "billItems",
          },
        ],
      },
      {
        model: models.SIPLProduct,
        as: "siplProducts",
        include: [
          {
            model: models.Product,
            as: "product",
          },
          {
            model: models.Slab,
            as: "slabs",
          },
        ],
      },
    ],
  });
};

// Get all SIPLs
export const getAllSIPLs = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  return await models.SIPL.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

// Get SIPL by Product for inventory product
export const getSIPLByProduct = async (productId: number, locationId: number) => {
  const SIPLs = await models.SIPL.findAll({
    include: [
      {
        model: models.Slab,
        where: { productId }, // Filter only slabs belonging to the given product
        required: true,
        include: [
          {
            model: models.Product,
            as: "product",
            attributes: ["id", "name"],
          },
          {
            model: models.Bin,
            as: "bin",
            required: true,
            include: [
              {
                model: models.Warehouse,
                as: "warehouse",
                where: { locationId },
                required: true,
              },
            ],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return SIPLs;
};

// update SIPL
export const updateSIPL = async (id: number, data: any, transaction: Transaction) => {
  await models.SIPL.update(data, {
    where: { id },
    transaction,
  });
};

import { col, fn, Op, Transaction } from "sequelize";
import * as models from "../models";
import { AppError } from "../helper/appError";

// Create SIPL
export async function createSIPL(siplData: any, transaction?: Transaction) {
  return await models.SIPL.create(siplData, { transaction });
}

// Get latest invoice number
export const getInvoiceNumber = async () => {
  let lastSIPL: any = await models.SIPL.findOne({
    order: [["id", "DESC"]],
    attributes: ["clientInvoiceNumber", "poSiplNumber"],
  });

  lastSIPL = lastSIPL?.get({ plain: true });

  return {
    clientInvoiceNumber: lastSIPL ? lastSIPL?.clientInvoiceNumber + 1 : 1,
    poSiplNumber: lastSIPL ? lastSIPL?.poSiplNumber + 1 : 1,
  };
};

// Get SIPL by ID with less data
export const findSIPLByIdSimple = async (id: number) => {

  return await models.SIPL.findByPk(id);
};

// Get SIPL by ID
export const findSIPLById = async (id: number, transaction?: Transaction) => {
  return await models.SIPL.findByPk(id, {
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        include: [
          {
            model: models.FreightDetail,
            as: "freightDetail",
            include: [
              {
                model: models.Vendor,
                as: "freightForwarder",
                attributes: ["name"],
              },
            ],
          },
          {
            model: models.Vendor,
            as: "supplier",
            attributes: ["name"],
          },
          {
            model: models.Location,
            as: "shipmentLocation",
            attributes: ["location"],
          },
          {
            model: models.Location,
            as: "purchaseLocation",
            attributes: ["location"],
          },
        ],
      },
      {
        model: models.Container,
        as: "containers",
      },
      {
        model: models.FreightDetail,
        as: "freightDetail",
        include: [
          {
            model: models.Vendor,
            as: "freightForwarder",
            attributes: ["name"],
          },
        ],
      },
      {
        model: models.Bill,
        where: { type: "freight" },
        as: "bills",
        required: false,
        include: [
          {
            model: models.Vendor,
            as: "vendor",
            attributes: ["name"],
          },
          {
            model: models.BillItem,
            as: "billItems",
            include: [
              {
                model: models.LedgerAccount,
                as: "ledgerAccount",
              },
            ],
          },
        ],
      },
      {
        model: models.SIPLProduct,
        as: "siplProducts",
        include: [
          {
            model: models.RequestedPurchaseProduct,
            as: "requestedPurchaseProduct",
            include: [
              {
                model: models.Product,
                as: "product",
              },
            ],
          },
          {
            model: models.Slab,
            as: "slabs",
            include: [
              {
                model: models.InventoryProduct,
                as: "inventoryProduct",
                include: [
                  {
                    model: models.Bin,
                    as: "bin",
                    include: [
                      {
                        model: models.Warehouse,
                        as: "warehouse",
                        include: [
                          {
                            model: models.Location,
                            as: "location",
                            attributes: ["location"],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: models.GenericProduct,
            as: "genericProducts",
            include: [
              {
                model: models.InventoryProduct,
                as: "inventoryProduct",
                include: [
                  {
                    model: models.Bin,
                    as: "bin",
                    include: [
                      {
                        model: models.Warehouse,
                        as: "warehouse",
                        include: [
                          {
                            model: models.Location,
                            as: "location",
                            attributes: ["location"],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: models.Location,
        as: "shipmentLocation",
        attributes: ["location"],
      },
      {
        model: models.Location,
        as: "purchaseLocation",
        attributes: ["location"],
      },
      {
        association: 'tradeServices'
      }
    ],
    transaction,
  });
};

// Get all SIPLs
export const getAllSIPLs = async (page: number, limit: number, clientId: number) => {
  const offset = (page - 1) * limit;

  return await models.SIPL.findAndCountAll({
    where: {
      clientId
    },
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        include: [
          {
            model: models.Vendor,
            as: "supplier"
          }
        ]
      },
      {
        model: models.Container,
        as: "containers",
        required: false,
        where: {
          referenceType: 'sipl'
        }
      },
      {
        model: models.Location,
        as: 'shipmentLocation'
      },
      {
        model: models.FreightDetail,
        as: "freightDetail",
        include: [
          {
            model: models.Vendor,
            as: 'freightForwarder'
          }
        ]
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

export const findSIPLBySlabId = async (slabId: number) => {
  const sipl = await models.SIPL.findOne({
    include: [
      {
        model: models.Slab,
        as: "slabs",
        where: { id: slabId },
        required: true,
      },
    ],
  });
  return sipl?.get({ plain: true });
};

// Get SIPL by Product for inventory product
export const getSIPLByProduct = async (productId: number, locationId: number) => {
  const SIPLs = await models.SIPL.findAll({
    include: [
      {
        association: "inventoryProducts",
        where: { productId },
        required: true,
        include: [
          {
            association: 'hold',
            attributes: ['id']
          },
          {
            association: "cartItem"
          },
          {
            association: "genericProduct",
          },
          {
            association: "slab",
          },
          {
            association: "bin",
            required: true,
            include: [
              {
                association: "warehouse",
                where: { locationId },
                required: true,
                include: [
                  {
                    association: "location",
                    attributes: ["location"],
                  },
                ]
              },
            ],
          },

        ],
      },
      {
        association: "purchaseOrder",
        attributes: ["id", "clientPoNumber"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return SIPLs;
};

export const getSIPLByVendor = async (supplierId: number) => {
  return await models.SIPL.findAll({
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        required: true,
        where: {
          supplierId,
        },
      },
    ],
  });
};

// update SIPL
export const updateSIPL = async (id: number, data: any, transaction: Transaction) => {
  await models.SIPL.update(data, {
    where: { id },
    transaction,
  });
};

// does all given bills belong to the given vendor
export const areSIPLsBelongingToVendor = async (supplierId: number, siplIds: number[]): Promise<boolean> => {
  const count = await models.SIPL.count({
    where: {
      id: {
        [Op.in]: siplIds, // Get only sipl that match the given IDs
      },
    },
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        where: { supplierId },
        required: true,
      },
    ],
  });

  return count === siplIds.length; // If count matches the number of IDs, all belong to vendor
};

export const getCombinedSIPlNumber = async (sipl: any, transaction: Transaction) => {
  if (!sipl.purchaseOrderId) {
    throw new AppError("purchaseOrderId is required to generate poSiplNumber.", 400);
  }

  const lastSIPLAccordingToPO: any = await models.SIPL.findOne({
    where: { purchaseOrderId: sipl.purchaseOrderId },
    order: [["poSiplNumber", "DESC"]],
    transaction
  });

  const purchaseOrder: any = await models.PurchaseOrder.findByPk(sipl.purchaseOrderId, { transaction })

  const poSiplNumber = lastSIPLAccordingToPO ? lastSIPLAccordingToPO.poSiplNumber + 1 : 1;

  return {
    poSiplNumber,
    invoiceCode: `VI ${purchaseOrder.clientPoNumber}-${poSiplNumber}`,
  }
}
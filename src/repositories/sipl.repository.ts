import { col, fn, Op, Transaction } from "sequelize";
import * as models from "../models";
import { AppError } from "../helper/appError";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { scoped } from "../utils/scoped";
import { AuthRequest } from "../middleware/authMiddleware";

// Create SIPL
export async function createSIPL(siplData: any, transaction?: Transaction) {
  return await scoped(models.SIPL).create(siplData, { transaction });
}

// Get latest invoice number
export const getInvoiceNumber = async () => {
  let lastSIPL: any = await scoped(models.SIPL).findOne({
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
            attributes: [
              "name", 
              "remitAddress", 
              "remitSuite", 
              "remitCity", 
              "remitState", 
              "remitZip", 
              "remitCountry", 
              "primaryPhoneNo", 
              "email"
            ],
          },
          {
            model: models.Location,
            as: "shipmentLocation",
            attributes: ["locationName", "contactName", "contactNumber", "contactMail", "address", "addressLine"],
          },
          {
            model: models.Location,
            as: "purchaseLocation",
            attributes: ["locationName", "contactName", "contactNumber", "contactMail", "address", "addressLine"],
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
                            attributes: ["locationName"],
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
                            attributes: ["locationName"],
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
        attributes: ["locationName", "contactName", "contactNumber", "contactMail", "address", "addressLine"],
      },
      {
        model: models.Location,
        as: "purchaseLocation",
        attributes: ["locationName", "contactName", "contactNumber", "contactMail", "address", "addressLine"],
      },
      {
        association: 'paymentBills',
        include: [{
          association: 'payment',
          attributes: ['transactionCode']

        }]
      },
      {
        association: 'tradeServices'
      }
    ],
    transaction,
  });
};

// Get all SIPLs
export const getAllSIPLs = async (
  page: number,
  limit: number,
  clientId: number,
  supplierId?: number,
  inventoryReceived?: boolean,
  search?: string
) => {
  const offset = (Number(page) - 1) * Number(limit);

  const where: any = { clientId };
  if (inventoryReceived !== undefined) {
    where.inventoryReceived = inventoryReceived;
  }
  if (search) {
    where.invoiceCode = {
      [Op.like]: `%${search}%`
    };
  }

  return await scoped(models.SIPL).findAndCountAll({
    where,
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        where: supplierId ? { supplierId } : undefined,
        required: !!supplierId,
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
    limit: Number(limit),
    offset: Number(offset),
    distinct: true,
    order: [["createdAt", "DESC"]],
  });
};

export const findSIPLBySlabId = async (slabId: number) => {
  const sipl = await scoped(models.SIPL).findOne({
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
export const getSIPLByProduct = async (req: AuthRequest, productId: number, locationId: number, excludeSoldCanceled = false) => {
  const inventoryProductsWhere: any = {
    productId,
    status: { [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN },
  };

  if (excludeSoldCanceled) {
    inventoryProductsWhere.status = {
      [Op.and]: [
        { [Op.ne]: INVENTORY_ITEM_STATUS.BROKEN },
        { [Op.notIn]: ['SOLD', 'CANCELED'] }
      ]
    };
  }

  const SIPLs = await scoped(models.SIPL).findAll({
    include: [
      {
        association: "inventoryProducts",
        where: inventoryProductsWhere,
        required: true,
        include: [
          {
            association: 'holdItem',
            attributes: ['id']
          },
          {
            association: "cartItem",
            where: {
              accountId: req.user?.accountId

            },
            required: false
          },
          {
            association: "genericProduct",
          },
          {
            association: "slab",
          },
          {
            association: "bin",
            // required: true,
            include: [
              {
                association: "warehouse",
                where: { locationId },
                // required: true,
                include: [
                  {
                    association: "location",
                    attributes: ["locationName"],
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
export const getOverdueSIPLsByVendor = async (supplierId: number, clientId: number, page: number, limit: number) => {
  const offset = (page - 1) * limit;

  return await scoped(models.SIPL).findAndCountAll({
    where: {
      clientId,
      dueDate: {
        [Op.lt]: new Date(),
      },
      status: {
        [Op.ne]: 'paid',
      }
    },
    include: [
      {
        model: models.PurchaseOrder,
        as: "purchaseOrder",
        where: { supplierId },
        required: true,
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["dueDate", "ASC"]],
  });
};

export const getSIPLByVendor = async (supplierId: number) => {
  return await scoped(models.SIPL).findAll({
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
  await scoped(models.SIPL).update(data, {
    where: { id },
    transaction,
  });
};

// does all given bills belong to the given vendor
export const areSIPLsBelongingToVendor = async (supplierId: number, siplIds: number[]): Promise<boolean> => {
  const count = await scoped(models.SIPL).count({
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

  const lastSIPLAccordingToPO: any = await scoped(models.SIPL).findOne({
    where: { purchaseOrderId: sipl.purchaseOrderId },
    order: [["poSiplNumber", "DESC"]],
    transaction
  });

  const purchaseOrder: any = await models.PurchaseOrder.findByPk(sipl.purchaseOrderId, { transaction })

  const poSiplNumber = lastSIPLAccordingToPO ? lastSIPLAccordingToPO.poSiplNumber + 1 : 1;

  return {
    poSiplNumber,
    invoiceCode: `VI ${purchaseOrder.clientPoNumber}-${poSiplNumber}`,
    paymentTermId: sipl.paymentTermId || purchaseOrder.paymentTermId,
  }
}
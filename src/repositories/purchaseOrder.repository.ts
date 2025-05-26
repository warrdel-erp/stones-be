import { col, fn, literal, Op, Sequelize, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { PO_STATUS } from "../constants/tableTypes";
import { get } from "lodash";

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
export const getAllPurchaseOrders = async (page: number, limit: number, clientId: number, filter: { [k: string]: string }) => {
  const offset = (page - 1) * limit;

  const { fromDate, toDate, ...otherFilters } = filter;

  const dateRange: any = {};

  if (fromDate && toDate) {
    dateRange.poDate = { [Op.between]: [fromDate, toDate] };
  } else if (fromDate) {
    dateRange.poDate = { [Op.gte]: fromDate };
  } else if (toDate) {
    dateRange.poDate = { [Op.lte]: toDate };
  }

  let getInInventoryData = false;

  if (otherFilters.status == 'IN_TRANSIT') {
    delete otherFilters.status;
    getInInventoryData = true;
  }

  return await models.PurchaseOrder.findAndCountAll({
    where: {
      ...otherFilters,
      ...dateRange,
      clientId
    },
    include: [
      {
        model: models.Vendor,
        as: "supplier",
        attributes: ["name", "vendorScope"],
      },
      {
        model: models.Container,
        as: "container",
      },
      {
        model: models.RequestedPurchaseProduct,
        as: "requestedPurchaseProducts",
        include: [
          {
            model: models.SIPLProduct,
            as: "siplProducts",
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
        model: models.SIPL,
        as: "sipls",
        where: {
          ...(getInInventoryData ? { inventoryReceived: false } : {})
        },
        required: getInInventoryData,
      },

    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

// Get po with pagination
export const getPaymentPendingPurchaseOrders = async (page: number, limit: number, clientId: number, filter: { [k: string]: string }) => {
  const offset = (page - 1) * limit;

  const { fromDate, toDate, ...otherFilters } = filter;

  const dateRange: any = {};

  if (fromDate && toDate) {
    dateRange.poDate = { [Op.between]: [fromDate, toDate] };
  } else if (fromDate) {
    dateRange.poDate = { [Op.gte]: fromDate };
  } else if (toDate) {
    dateRange.poDate = { [Op.lte]: toDate };
  }

  const pos: any = await models.PurchaseOrder.findAndCountAll({
    where: {
      clientId
    },
    attributes: [
      "id",
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn(
            "SUM",
            Sequelize.literal("`sipls->siplProducts`.`quantity` * `sipls->siplProducts`.`unitPrice`")
          ),
          0
        ),
        "totalSIPLProductQuantity"
      ],
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn(
            "SUM",
            Sequelize.literal("`sipls->paymentBills`.`amount`")
          ),
          0
        ),
        "totalPayedBillsAmount"
      ]
    ],
    include: [
      {
        model: models.SIPL,
        as: 'sipls', // Adjust alias if necessary
        attributes: [],
        include: [
          {
            model: models.SIPLProduct,
            as: 'siplProducts', // Adjust alias if necessary
            attributes: [] // We don't need to select fields from siplProducts, just to aggregate the quantities
          },
          {
            model: models.PaymentBill,
            as: 'paymentBills', // Adjust alias if necessary
            attributes: [] // We don't need to select fields from siplProducts, just to aggregate the quantities
          },
        ]
      }
    ],
    limit,
    offset,
    subQuery: false,
    order: [["createdAt", "DESC"]],
    group: ['PurchaseOrder.id'], // Ensure we group by purchase_order's ID,
    having: Sequelize.literal(
      "COALESCE(SUM(`sipls->siplProducts`.`quantity` * `sipls->siplProducts`.`unitPrice`), 0) > COALESCE(SUM(`sipls->paymentBills`.`amount`), 0)"
    )
  });

  pos.rows = await Promise.all(pos.rows.map(async (po: any) => {
    const poData = (await getPurchaseOrderById(po.id))

    return { ...structuredClone(poData), ...po.get({ plain: true }) }
  }))

  return pos
};

// Get PO detail by ID
export const getPurchaseOrderById = async (id: number) => {
  let result: any = await models.PurchaseOrder.findOne({
    include: [
      {
        model: models.Vendor,
        as: "supplier",
      },
      {
        model: models.Container,
        as: "container",
      },
      {
        model: models.RequestedPurchaseProduct,
        as: "requestedPurchaseProducts",
        include: [
          { model: models.SIPLProduct, as: "siplProducts" },
          { model: models.Product, as: "product", attributes: ["name"] },
        ],
      },
      {
        model: models.SIPL,
        as: "sipls",
        include: [
          {
            model: models.SIPLProduct,
            as: "siplProducts",
            attributes: ["id", "quantity", "unitPrice"],
          },
          {
            model: models.Container,
            as: "containers",
          },
        ],
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
        model: models.Notes,
        as: "notes",
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
    where: { id },
  });

  result = result?.get({ plain: true });

  return result;
};

// Get po by id
export const getPOWithVendorLedgerAccount = async (id: number, transaction?: Transaction) => {
  return (
    await models.PurchaseOrder.findByPk(id, {
      include: [
        {
          model: models.Vendor,
          as: "supplier",
          attributes: ["id"],
          include: [
            {
              model: models.LedgerAccount,
              as: "ledgerAccount",
              attributes: ["id"],
            },
          ],
        },
      ],
      transaction,
    })
  )?.get({ plain: true });
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

export const countOpenPOByClientId = async (clientId: number) => {
  return await models.PurchaseOrder.count({
    where: {
      clientId,
      status: PO_STATUS.OPEN,
    },
  });
};

export const countPoInTransit = async (clientId: number) => {
  return await models.PurchaseOrder.count({
    include: [
      {
        model: models.SIPL,
        as: "sipls",
        where: {
          inventoryReceived: false,
        },
        required: true,
      },
    ],
    where: {
      clientId,
    },
  });
};
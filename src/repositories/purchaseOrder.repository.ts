import { col, fn, literal, Op, Sequelize, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { PO_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

/**
 * Create a new Purchase Order in the database.
 */
export const createPurchaseOrder = async (poData: any, transaction?: Transaction) => {
  return await scoped(models.PurchaseOrder).create(poData, { transaction, hooks: true });
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

  return await scoped(models.RequestedPurchaseProduct).bulkCreate(productsWithPoId, { transaction });
}

// Create freight Details
export async function createFreightDetail(
  freightData: any,
  { purchaseOrderId, siplId }: { purchaseOrderId?: number; siplId?: number },
  transaction?: Transaction
) {
  return await scoped(models.FreightDetail).create({ ...freightData, siplId, purchaseOrderId }, { transaction });
}

// Get po with pagination
export const getAllPurchaseOrders = async (page: number, limit: number, clientId: number, filter: { [k: string]: string }) => {
  const offset = (page - 1) * limit;

  const { fromDate, toDate, search, ...otherFilters } = filter;

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

  const whereClause: any = {
    ...otherFilters,
    ...dateRange,
    clientId
  };

  if (search) {
    const isNumeric = !isNaN(Number(search));
    const searchConditions: any[] = [
      { "$supplier.name$": { [Op.like]: `%${search}%` } }
    ];
    if (isNumeric) {
      searchConditions.push({ clientPoNumber: Number(search) });
    }
    whereClause[Op.or] = searchConditions;
  }

  return await scoped(models.PurchaseOrder).findAndCountAll({
    where: whereClause,
    include: [
      {
        model: models.Vendor,
        as: "supplier",
        attributes: ["name", "vendorScope"],
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
        attributes: ["locationName"],
      },
      {
        model: models.Location,
        as: "purchaseLocation",
        attributes: ["locationName"],
      },
      {
        model: models.SIPL,
        as: "sipls",
        where: {
          ...(getInInventoryData ? { inventoryReceived: false } : {})
        },
        required: getInInventoryData,
        include: [
          {
            model: models.Bill,
            as: "bills",
            required: false,
            include: [
              {
                model: models.BillItem,
                as: "billItems",
                attributes: ["amount"],
                required: false,
              },
            ],
          },
        ],
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

  const { fromDate, toDate } = filter;

  const dateRange: any = {};

  if (fromDate && toDate) {
    dateRange.poDate = { [Op.between]: [fromDate, toDate] };
  } else if (fromDate) {
    dateRange.poDate = { [Op.gte]: fromDate };
  } else if (toDate) {
    dateRange.poDate = { [Op.lte]: toDate };
  }

  const pos: any = await scoped(models.PurchaseOrder).findAndCountAll({
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

  pos.count = Array.isArray(pos.count) ? pos.count.length : pos.count;

  return pos;
};

// Get PO detail by ID
export const getPurchaseOrderById = async (id: number) => {
  let result: any = await scoped(models.PurchaseOrder).findOne({
    include: [
      {
        model: models.Vendor,
        as: "supplier",
      },
      {
        model: models.RequestedPurchaseProduct,
        as: "requestedPurchaseProducts",
        include: [
          { model: models.SIPLProduct, as: "siplProducts" },
          { model: models.Product, as: "product", attributes: ["name", "isSlabType"] },
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
          {
            model: models.InventoryProduct,
            as: "inventoryProducts",
            attributes: ["id", "status"],
            include: [
              {
                model: models.Slab,
                as: "slab",
                attributes: ["id", "packageLength", "packageWidth", "receivingLength", "receivingWidth"]
              }
            ]
          }
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
        attributes: ["locationName"],
      },
      {
        model: models.Location,
        as: "purchaseLocation",
        attributes: ["locationName"],
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
  return await scoped(models.SIPL).findAll({
    where: { purchaseOrderId },
    raw: true,
    nest: true,
  });
};

// Get latest PO number
export const getPoNumber = async (clientId: number) => {
  const lastPO: any = await scoped(models.PurchaseOrder).findOne({
    where: { clientId },
    order: [["clientPoNumber", "DESC"]],
    attributes: ["clientPoNumber"],
  });

  return { clientPoNumber: lastPO ? lastPO?.clientPoNumber + 1 : 1 };
};

export async function updatePurchaseOrderStatus(purchaseOrderId: number, status: string, transaction?: any) {
  return await scoped(models.PurchaseOrder).update(
    { status },
    { where: { id: purchaseOrderId }, transaction, returning: true }
  );
}

export const countOpenPOByClientId = async (clientId: number) => {
  return await scoped(models.PurchaseOrder).count({
    where: {
      clientId,
      status: PO_STATUS.OPEN,
    },
  });
};

export const countPoInTransit = async (clientId: number) => {
  return await scoped(models.PurchaseOrder).count({
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

export const updatePurchaseOrder = async (id: number, data: any, transaction?: Transaction) => {
  return await scoped(models.PurchaseOrder).update(data, { where: { id }, transaction });
};

export const getFreightDetailByPoId = async (purchaseOrderId: number, transaction?: Transaction) => {
  return await scoped(models.FreightDetail).findOne({ where: { purchaseOrderId }, transaction });
};

export const updateFreightDetail = async (purchaseOrderId: number, data: any, transaction?: Transaction) => {
  return await scoped(models.FreightDetail).update(data, { where: { purchaseOrderId }, transaction });
};
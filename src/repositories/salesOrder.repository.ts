import { Transaction, Op, Sequelize, fn, cast, col } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";
import { SALES_ORDER_STATUS } from "../constants/tableTypes";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await models.SalesOrder.create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async (
  page: number,
  limit: number,
  clientId: number,
  filter?: { [k: string]: string }
) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    where: {
      clientId,
      ...filter,
    },
    attributes: {
      include: [
        [
          // Count the number of associated Loading Orders
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM loading_orders AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "loadingOrderCount",
        ],
      ],
    },
    include: [
      {
        association: "customer",
        attributes: ["id", "salesTax", "scope", "daysForHold", "name", "primaryPhoneNumber"],
      },
      {
        association: "loadingOrders",
        attributes: ["id", "code"],
        include: [
          {
            association: "packagingList",
            attributes: ["id", "code"],
          }
        ]
      },
      {
        association: "createdBy",
        attributes: ["id", "username", "phone"],
      },
      {
        association: "soLocation",
        attributes: ["id", "location"],
      },
      {
        association: "notes",
      },
      {
        association: "salesOrderProducts",
        attributes: ["id", "unitPrice", "stage"],
        include: [
          {
            association: "inventoryProduct",
            attributes: ["id"],
            include: [
              {
                association: "slab",
                attributes: ["id", "receivingLength", "receivingWidth"],
              },
            ],
          },
        ],
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get all sales order
export const getAllSalesOrdersOnlyWithLoadingOrder = async (page: number, limit: number, clientId: number) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    where: {
      clientId,
    },
    attributes: {
      include: [
        [
          // Count the number of associated Loading Orders
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM loading_orders AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "loadingOrderCount",
        ],
      ],
    },
    include: [
      {
        association: "customer",
        attributes: ["id", "salesTax", "scope", "daysForHold", "name", "primaryPhoneNumber"],
      },
      {
        association: "loadingOrders",
        required: true,
      },
      {
        association: "createdBy",
        attributes: ["id", "username", "phone"],
      },
      {
        association: "soLocation",
        attributes: ["id", "location"],
      },
      {
        association: "notes",
      },
      {
        association: "salesOrderProducts",
        attributes: ["id", "unitPrice", "stage"],
        include: [
          {
            association: "inventoryProduct",
            attributes: ["id"],
            include: [
              {
                association: "slab",
                attributes: ["id", "receivingLength", "receivingWidth"],
              },
            ],
          },
        ],
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get all sales order
export const getAllSalesOrdersOnlyWithPackagingList = async (page: number, limit: number, clientId: number) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    where: {
      clientId,
      id: {
        [Op.in]: sequelize.literal(`(
          SELECT DISTINCT so.id 
          FROM sales_orders so
          INNER JOIN loading_orders lo ON lo.salesOrderId = so.id
          INNER JOIN packaging_lists pl ON pl.loadingOrderId = lo.id
          WHERE so.clientId = ${clientId}
        )`),
      },
    },
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM loading_orders AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "loadingOrderCount",
        ],
      ],
    },
    include: [
      {
        association: "customer",
        attributes: ["id", "salesTax", "scope", "daysForHold", "name", "primaryPhoneNumber"],
      },
      {
        association: "loadingOrders",
        include: [
          {
            association: "packagingList",
          },
        ],
      },
      {
        association: "createdBy",
        attributes: ["id", "username", "phone"],
      },
      {
        association: "soLocation",
        attributes: ["id", "location"],
      },
      {
        association: "notes",
      },
      {
        association: "salesOrderProducts",
        attributes: ["id", "unitPrice", "stage"],
        include: [
          {
            association: "inventoryProduct",
            attributes: ["id"],
            include: [
              {
                association: "slab",
                attributes: ["id", "receivingLength", "receivingWidth"],
              },
            ],
          },
        ],
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get SO with pagination
// const getPaymentPendingSalesOrders = async (page: number, limit: number, clientId: number, filter: { [k: string]: string }) => {
//   const offset = (page - 1) * limit;

//   const { fromDate, toDate } = filter;

//   const dateRange: any = {};

//   if (fromDate && toDate) {
//     dateRange.poDate = { [Op.between]: [fromDate, toDate] };
//   } else if (fromDate) {
//     dateRange.poDate = { [Op.gte]: fromDate };
//   } else if (toDate) {
//     dateRange.poDate = { [Op.lte]: toDate };
//   }

//   const pos: any = await models.SalesOrder.findAndCountAll({
//     where: {
//       clientId
//     },
//     attributes: [
//       "id",
//       [
//         Sequelize.fn(
//           "COALESCE",
//           Sequelize.fn(
//             "SUM",
//             Sequelize.literal("`sipls->paymentBills`.`amount`")
//           ),
//           0
//         ),
//         "totalPayedBillsAmount"
//       ]
//     ],
//     include: [
//       {
//         as: 'loadingOrders', // Adjust alias if necessary
//         attributes: [],
//         include: [
//           {
//             model: models.PaymentBill,
//             as: 'paymentBills', // Adjust alias if necessary
//             attributes: [] // We don't need to select fields from siplProducts, just to aggregate the quantities
//           },
//         ]
//       }
//     ],
//     limit,
//     offset,
//     subQuery: false,
//     order: [["createdAt", "DESC"]],
//     group: ['PurchaseOrder.id'], // Ensure we group by purchase_order's ID,
//     having: Sequelize.literal(
//       "COALESCE(SUM(`sipls->siplProducts`.`quantity` * `sipls->siplProducts`.`unitPrice`), 0) > COALESCE(SUM(`sipls->paymentBills`.`amount`), 0)"
//     )
//   });

//   pos.rows = await Promise.all(pos.rows.map(async (po: any) => {
//     const poData = (await getPurchaseOrderById(po.id))

//     return { ...structuredClone(poData), ...po.get({ plain: true }) }
//   }))

//   return pos
// };


// Get One SO
export const getSalesOrderById = async (id: number) => {
  return await models.SalesOrder.findOne({
    where: { id },
    include: [
      { association: "customer" },
      { association: 'advancedDeposits' },
      { association: "createdBy" },
      { association: "shippingAddress" },
      { association: "notes" },
      { association: "soLocation" },
      {
        association: "salesOrderProducts",
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "bin",
                attributes: ["id", "name"],
              },
              {
                association: "slab",
                include: [
                  {
                    association: "product",
                  },
                ],
              },
              {
                association: "genericProduct",
                include: [
                  {
                    association: "product",
                  },
                ],
              },
            ],
          },
          {
            association: "loadingOrder",
            attributes: ["id", "code"],
            include: [
              {
                association: "packagingList",
                attributes: ["id", "code"],
              }
            ]
          },
        ],
      },
    ],
  });
};

// Get latest SO number
export const getSoNumber = async (clientId: number) => {
  const lastSO: any = await models.SalesOrder.findOne({
    where: { clientId },
    order: [["clientSoNumber", "DESC"]],
    attributes: ["clientSoNumber"],
  });

  return { clientSoNumber: lastSO ? lastSO?.clientSoNumber + 1 : 1 };
};

// Get all open SO by clientId
export const countOpenSOByClientId = async (clientId: number) => {
  return await models.SalesOrder.count({
    where: {
      clientId,
      status: SALES_ORDER_STATUS.OPEN,
    },
  });
};

// Get total paid amount for a SO.
export const getTotalPaidAmountForSO = (id: number) => {
  return models.SalesOrder.findByPk(id, {
    attributes: [
      'id',
      [
        fn('COALESCE', fn("SUM", cast(col('salesOrderInvoices->paymentBills.amount'), 'double')), 0), 'totalPaidAmount'
      ]
    ],
    include: [
      {
        association: "salesOrderInvoices",
        attributes: [],
        include: [
          {
            association: 'paymentBills',
            attributes: []
          }
        ]
      }
    ],
    group: ['id']
  })
}
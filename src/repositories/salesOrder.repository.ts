import { Transaction, Op, Sequelize, fn, cast, col } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await scoped(models.SalesOrder).create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async (
  page: number,
  limit: number,
  clientId: number,
  filter?: { [k: string]: string }
) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await scoped(models.SalesOrder).findAndCountAll({
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
            FROM packaging_lists AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "packagingListCount",
        ],
      ],
    },
    include: [
      {
        association: "customer",
        attributes: ["id", "scopeId", 'scope', "daysForHold", "name", "primaryPhoneNumber"],
      },
      {
        association: "loadingOrders",
        attributes: ["id", "code"],
        include: [
          {
            association: "loadingOrder",
            attributes: ["id", "code"],
          }
        ]
      },
      {
        association: "createdBy",
        attributes: ["id", "email"],
        include: [
          {
            association: "user",
            attributes: ["id", "username", "phone"],
          },
        ],
      },
      {
        association: "soLocation",
        attributes: ["id", "locationName"],
      },
      {
        association: "notes",
      },
      {
        association: "salesOrderProducts",
        include: [
          {
            association: "inventoryProduct",
            attributes: ["id", 'landedUnitCost'],
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
  const { rows: data, count: total } = await scoped(models.SalesOrder).findAndCountAll({
    where: {
      clientId,
    },
    attributes: {
      include: [
        [
          // Count the number of associated Loading Orders
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM packaging_lists AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "packagingListCount",
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
        attributes: ["id", "email"],
        include: [
          {
            association: "user",
            attributes: ["id", "username", "phone"],
          },
        ],
      },
      {
        association: "soLocation",
        attributes: ["id", "locationName"],
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
  const { rows: data, count: total } = await scoped(models.SalesOrder).findAndCountAll({
    where: {
      clientId,
      id: {
        [Op.in]: sequelize.literal(`(
          SELECT DISTINCT so.id 
          FROM sales_orders so
          INNER JOIN packaging_lists lo ON lo.salesOrderId = so.id
          INNER JOIN loading_orders pl ON pl.loadingOrderId = lo.id
          WHERE so.clientId = ${clientId}
        )`),
      },
    },
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM packaging_lists AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "packagingListCount",
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
            association: "loadingOrder",
          },
        ],
      },
      {
        association: "createdBy",
        attributes: ["id", "email"],
        include: [
          {
            association: "user",
            // attributes: ["id", "username", "phone"],
          },
        ],
      },
      {
        association: "soLocation",
        attributes: ["id", "locationName"],
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

//   const pos: any = await scoped(models.SalesOrder).findAndCountAll({
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
  return await scoped(models.SalesOrder).findOne({
    where: { id },
    include: [
      {
        association: "customer",
        include: [
          {
            association: "addresses",
          }
        ]

      },

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
                association: "product",
              },
              {
                association: "bin",
                attributes: ["id", "name"],
              },
              {
                association: "slab",
              },
              {
                association: "genericProduct",
              },
            ],
          },
          {
            association: "packagingList",
            attributes: ["id", "code"],
            include: [
              {
                association: "loadingOrder",
                attributes: ["id", "code"],
              }
            ]
          },
        ],
      },
      {
        association: 'loadingOrders',
        attributes: ['id', 'code', 'plDate', 'stage'],
        include: [
          {
            association: 'loadingOrder',
            attributes: ['id', 'code'],
          },
          {
            association: 'salesOrderProducts',
            include: [
              {
                association: 'inventoryProduct'
              }
            ]
          },
          {
            association: "salesOrderInvoice"
          },
        ]
      }
    ],
  });
};

// Get One SO
export const getSalesOrderByIdForCreateLO = async (id: number) => {
  return await scoped(models.SalesOrder).findOne({
    where: { id },
    include: [
      {
        association: "customer",
        include: [
          {
            association: 'addresses'
          }
        ]
      },
      { association: "shippingAddress" },
      { association: "notes" },
      { association: "soLocation" },
      {
        association: "salesOrderProducts",
        where: { stage: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER },
        required: false,
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "product",
              },
              {
                association: "bin",
                attributes: ["id", "name"],
                include: [
                  {
                    association: "warehouse",
                    include: [
                      {
                        association: "location",
                        attributes: ["id", "locationName"],
                      }
                    ]
                  }
                ]
              },
              {
                association: "slab",

              },
              {
                association: "genericProduct",
              },
            ],
          },
          {
            association: "packagingList",
            attributes: ["id", "code"],
            include: [
              {
                association: "loadingOrder",
                attributes: ["id", "code"],
              }
            ]
          },
        ],
      },
      {
        association: 'loadingOrders',
        attributes: ['id', 'code', 'plDate', 'stage'],
        include: [
          {
            association: 'loadingOrder',
            attributes: ['id', 'code'],
          },
          {
            association: 'salesOrderProducts'
          },
          {
            association: "salesOrderInvoice"
          },
        ]
      }
    ],
  });
};

// Get latest SO number
export const getSoNumber = async (clientId: number) => {
  const lastSO: any = await scoped(models.SalesOrder).findOne({
    where: { clientId },
    order: [["clientSoNumber", "DESC"]],
    attributes: ["clientSoNumber"],
  });

  return { clientSoNumber: lastSO ? lastSO?.clientSoNumber + 1 : 1 };
};

// Get all open SO by clientId
export const countOpenSOByClientId = async (clientId: number) => {
  return await scoped(models.SalesOrder).count({
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

export const getSimpleSalesOrder = (id: number, transaction?: Transaction) => {
  return models.SalesOrder.findByPk(id, { transaction })
}
import { Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { LOADING_ORDER_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { RETURN_STATUS } from "../models/return.model";

// Create new LO
export const createLoadingOrder = async (data: any, transaction?: Transaction) => {
  return await models.LoadingOrder.create(data, { transaction });
};

// Get all LO
export const getAllLoadingOrders = async (page: number, limit: number, clientId: number, filters?: any) => {
  const offset = (page - 1) * limit;

  const whereClause: any = { ...filters };

  // Add clientId filter if provided
  if (clientId) {
    whereClause.clientId = clientId;
  }

  if (filters.notInvoicedOnly === "true") {
    whereClause.stage = {
      [Op.ne]: [LOADING_ORDER_STAGES.INVOICED],
    };

    delete whereClause.notInvoicedOnly;
  }

  const { rows: data, count: total } = await models.LoadingOrder.findAndCountAll({
    where: {
      ...whereClause,
    },
    include: [
      {
        model: models.SalesOrder,
        as: "salesOrder",
        include: [
          { model: models.Customer, as: "customer" },
          { model: models.Location, as: "soLocation" },
        ],
      },
      { model: models.PackagingList, as: "packagingList" },
      { model: models.SalesOrderProduct, as: "salesOrderProducts" },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get all LO without pagination
export const getAllLoadingOrdersWithoutPagination = async (filters: WhereOptions) => {
  const loadingOrders = await models.LoadingOrder.findAll({
    where: filters,
    include: [
      {
        association: "salesOrder",
        include: [
          {
            association: 'customer'
          }
        ]
      },
      {
        association: "salesOrderProducts"
      },
      {
        association: "packagingList"
      },
      {
        association: "salesOrderInvoice"
      },
    ],
  });

  return loadingOrders;
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await models.LoadingOrder.findByPk(id, {
    include: [
      {
        association: "salesOrder",
        include: [
          {
            association: "customer",
            include: [
              {
                association: "addresses"
              }
            ],
          },
          {
            association: "shippingAddress",
          },
          {
            association: "salesOrderProducts",
            attributes: ["id", "unitPrice"],
            include: [
              {
                association: "inventoryProduct",
                attributes: ["id", "landedUnitCost"],
                include: [
                  {
                    association: "product",
                    attributes: ["id", "isSlabType"],
                  },
                ],
              },
            ],
          },
          {
            association: "soLocation",
            attributes: ["id", "location"],
          },
        ],
      },
      {
        association: "salesOrderProducts",
        required: false,
        include: [
          {
            association: "inventoryProduct",

            include: [
              {
                association: "product",
                attributes: ["id", 'name', "isSlabType"],
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
                include: [
                  {
                    association: "product",
                  },
                ],
              },
            ],
          },
          {
            association: 'returnProducts',
            attributes: ['id'],
            include: [
              {
                association: 'return',
                attributes: ['id', 'status'],
                required: true,
                where: {
                  status: {
                    [Op.in]: [RETURN_STATUS.COMPLETE, RETURN_STATUS.INITIATED]
                  }
                }
              }
            ]
          }
        ],
      },
      {
        association: "packagingList",
        include: [
          {
            association: "salesOrderProducts"
          }
        ],
      },
      {
        association: "shippingAddress",
      },
      {
        association: "salesOrderInvoice",
      },
    ],
  });

  return loadingOrder?.get({ plain: true });
};

// Get loading order by Id
export const getLoadingOrderAsPerReturn = async (id: number, returnId: number) => {
  const loadingOrder = await models.LoadingOrder.findByPk(id, {
    include: [
      {
        association: "salesOrder",
        include: [
          {
            association: "customer",
            include: [
              {
                association: "addresses"
              }
            ],
          },
          {
            association: "shippingAddress",
          },
          {
            association: "salesOrderProducts",
            attributes: ["id", "unitPrice"],
            include: [
              {
                association: "inventoryProduct",
                attributes: ["id", "landedUnitCost", 'productId'],

                include: [
                  {
                    association: "product",
                    attributes: ["id",],
                  },
                  {
                    association: "slab",
                    attributes: ["id", "receivingLength", "receivingWidth"]
                  },
                  {
                    association: "genericProduct",
                  },
                ],
              },
            ],
          },
          {
            association: "soLocation",
            attributes: ["id", "location"],
          },
        ],
      },
      {
        association: "salesOrderProducts",
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
            association: 'returnProducts',
            attributes: ['id', 'returnId'],
            where: { returnId },
            required: true
          }
        ],
      },
      {
        association: "packagingList",
        include: [
          {
            association: "salesOrderProducts"
          }
        ],
      },
      {
        association: "shippingAddress",
      },
      {
        association: "salesOrderInvoice",
      },
    ],
  });

  return loadingOrder?.get({ plain: true });
};

// Get loading order by Id
export const getLoadingOrderByIdSimple = async (id: number, transaction?: Transaction) => {
  return await models.LoadingOrder.findByPk(id, { transaction });
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await models.LoadingOrder.findAll({
    where: { salesOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.LoadingOrderProduct, as: "loadingOrderProducts" },
    ],
  });
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any, transaction?: Transaction) => {
  const loadingOrder = await models.LoadingOrder.update(data, { where: { id }, transaction, individualHooks: true });
  return loadingOrder;
};

// Get latest SO number
export const getLoNumber = async (clientId: number) => {
  const lastLO: any = await models.LoadingOrder.findOne({
    where: { clientId },
    order: [["clientLoNumber", "DESC"]],
    attributes: ["clientLoNumber"],
  });

  return { clientLoNumber: lastLO ? lastLO?.clientLoNumber + 1 : 1 };
};

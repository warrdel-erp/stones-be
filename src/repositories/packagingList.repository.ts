import { Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { DELIVERY_STATUS, PACKAGING_LIST_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { RETURN_STATUS } from "../models/return.model";
import { scoped } from "../utils/scoped";
import { sequelize } from "../config/database";

// Create new LO
export const createPackagingList = async (data: any, transaction?: Transaction) => {
  return await scoped(models.PackagingList).create(data, { transaction });
};

// Get all LO
export const getAllPackagingLists = async (page: number, limit: number, clientId: number, filters?: any) => {
  const offset = (page - 1) * limit;

  const whereClause: any = { ...filters };

  // Add clientId filter if provided
  if (clientId) {
    whereClause.clientId = clientId;
  }

  if (filters.notInvoicedOnly === "true") {
    whereClause.stage = {
      [Op.ne]: [PACKAGING_LIST_STAGES.INVOICED],
    };

    delete whereClause.notInvoicedOnly;
  }

  if (filters.deliveryStatus) {
    if (filters.deliveryStatus === 'pending') {
      whereClause.id = {
        [Op.notIn]: sequelize.literal(`(
          SELECT packagingListId FROM invoice_deliveries id
          JOIN deliveries d ON id.deliveryId = d.id
          WHERE d.status IN ('pending', 'approved', 'started', 'completed')
        )`)
      };
    } else if (filters.deliveryStatus === 'assigned') {
      whereClause.id = {
        [Op.in]: sequelize.literal(`(
          SELECT packagingListId FROM invoice_deliveries id
          JOIN deliveries d ON id.deliveryId = d.id
          WHERE d.status IN ('pending', 'approved', 'started')
        )`)
      };
    }
    delete whereClause.deliveryStatus;
  }


  const { rows: data, count: total } = await scoped(models.PackagingList).findAndCountAll({
    distinct: true,
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
      { model: models.LoadingOrder, as: "loadingOrder" },
      {
        association: "salesOrderProducts",
        include: [
          {
            association: 'inventoryProduct',
            include: [
              { association: 'product' },
              { association: 'slab' }
            ]
          }
        ]
      },
      { association: 'shippingAddress' },
      {
        association: 'invoiceDeliveries',
        required: false,
        separate: true,
        include: [
          {
            association: 'delivery',
            where: {
              status: {
                [Op.notIn]: [DELIVERY_STATUS.REJECTED]
              }
            },
            required: true
          }
        ]
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get all PL without pagination
export const getAllPackagingListsWithoutPagination = async (filters: WhereOptions) => {
  const loadingOrders = await scoped(models.PackagingList).findAll({
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
        association: "loadingOrder"
      },
      {
        association: "salesOrderInvoice"
      },
    ],
  });

  return loadingOrders;
};

// Get packaging list by Id
export const getPackagingListById = async (id: number) => {
  const packagingList = await models.PackagingList.findByPk(id, {
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
            attributes: ["id", "locationName", 'lat', 'long', 'address'],
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
            required: false,
            include: [
              {
                association: 'return',
                attributes: ['id', 'status'],
                required: false,
                where: {
                  status: {
                    [Op.in]: [RETURN_STATUS.COMPLETE, RETURN_STATUS.INITIATED]
                  }
                }
              }
            ]
          },
          {
            association: 'swapHistories',
            attributes: ['id']
          }
        ],
      },
      {
        association: "loadingOrder",
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
      {
        association: 'tradeServices',
        // attributes: ['id', 'total'],
        include: [
          {
            association: 'service',
            attributes: ['id', 'name', 'ledgerAccountId'],
          }
        ]
      }
    ],
  });

  return packagingList?.get({ plain: true });
};

// Get packaging list by Id
export const getPackagingListAsPerReturn = async (id: number, returnId: number) => {
  const packagingList = await models.PackagingList.findByPk(id, {
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
            attributes: ["id", "locationName"],
          },
        ],
      },
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
            association: 'returnProducts',
            attributes: ['id', 'returnId'],
            where: { returnId },
            required: true
          }
        ],
      },
      {
        association: "loadingOrder",
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

  return packagingList?.get({ plain: true });
};

// Get packaging list by Id
export const getPackagingListByIdSimple = async (id: number, transaction?: Transaction) => {
  return await models.PackagingList.findByPk(id, { transaction });
};

// Get packaging list by SO id
export const getPackagingListsBySalesOrderId = async (salesOrderId: number) => {
  return await scoped(models.PackagingList).findAll({
    where: { salesOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.PackagingListProduct, as: "packagingListProducts" },
    ],
  });
};

// Update Packaging List
export const updatePackagingList = async (id: number, data: any, transaction?: Transaction) => {
  const packagingList = await scoped(models.PackagingList).update(data, { where: { id }, transaction, individualHooks: true });
  return packagingList;
};

// Get latest SO number
export const getPlNumber = async (clientId: number, salesOrderId?: number) => {
  const lastPLByClient: any = await scoped(models.PackagingList).findOne({
    where: { clientId },
    order: [["clientPlNumber", "DESC"]],
    attributes: ["clientPlNumber"],
  });

  const clientPlNumber = lastPLByClient ? lastPLByClient.clientPlNumber + 1 : 1;

  if (salesOrderId) {
    const lastPLBySo: any = await scoped(models.PackagingList).findOne({
      where: { salesOrderId },
      order: [["soPackagingListNumber", "DESC"]],
      attributes: ["soPackagingListNumber"],
    });

    return {
      clientPlNumber,
      soPackagingListNumber: lastPLBySo ? lastPLBySo.soPackagingListNumber + 1 : 1,
    };
  }

  return { clientPlNumber };
};

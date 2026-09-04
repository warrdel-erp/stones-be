import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

// Create new LO
export const createLoadingOrder = async (data: any, transaction?: Transaction) => {
  return await scoped(models.LoadingOrder).create(data, { transaction });
};

// Get all LO
export const getAllLoadingOrders = async () => {
  return await scoped(models.LoadingOrder).findAll({
    include: [{ model: models.PackagingList, as: "packagingList" }],
  });
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  return (
    await models.LoadingOrder.findByPk(id, {
      include: [
        {
          association: "salesOrder",
          include: [
            { association: "createdBy", include: ["user"] },
            {
              association: "customer",
              attributes: ["id", "name", "salesTax"],
              include: [
                {
                  association: "addresses",
                },
              ],
            },
            {
              association: "shippingAddress",
            },
            {
              association: "soLocation",
              attributes: ["id", "locationName", "lat", "long", "address"],
            },
          ]
        },
        {
          association: "packagingList",
          include: [
            {
              association: "shippingAddress",
            },
            {
              association: "salesOrder",
              include: [
                {
                  association: "customer",
                  attributes: ["id", "name", "salesTax"],
                  include: [
                    {
                      association: "addresses",
                    },
                  ],
                },
                {
                  association: "shippingAddress",
                },
                {
                  association: "soLocation",
                  attributes: ["id", "locationName", "lat", "long", "address"],
                },
              ],
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
              association: "swapHistories",
              attributes: ['id']
            },
          ],
        },
      ],
    })
  )?.get({ plain: true });
};

// Get loading order by Id
export const getLoadingOrderByIdSimple = async (id: number, transaction?: Transaction) => {
  return await models.LoadingOrder.findByPk(id, { transaction });
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await scoped(models.LoadingOrder).findAll({
    where: { salesOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
    ],
  });
};

// Update Packaging List
export const updateLoadingOrder = async (id: number, data: any, transaction?: Transaction) => {
  const loadingOrder = await models.LoadingOrder.findByPk(id, { transaction });
  if (!loadingOrder) return null;

  await loadingOrder.update(data);
  return loadingOrder;
};

// Get latest LO number
export const getPlNumber = async (clientId: number, salesOrderId?: number) => {
  const lastLOByClient: any = await scoped(models.LoadingOrder).findOne({
    where: { clientId },
    order: [["clientLoNumber", "DESC"]],
    attributes: ["clientLoNumber"],
  });

  const clientLoNumber = lastLOByClient ? lastLOByClient.clientLoNumber + 1 : 1;

  if (salesOrderId) {
    const lastLOBySo: any = await scoped(models.LoadingOrder).findOne({
      where: { salesOrderId },
      order: [["soLoadingOrderNumber", "DESC"]],
      attributes: ["soLoadingOrderNumber"],
    });

    return {
      clientLoNumber,
      soLoadingOrderNumber: lastLOBySo ? lastLOBySo.soLoadingOrderNumber + 1 : 1,
    };
  }

  return { clientLoNumber };
};

export const updateLoadingOrderByPackagingListId = async (
  packagingListId: number,
  data: any,
  transaction?: Transaction
) => {
  return await scoped(models.LoadingOrder).update(data, {
    where: { packagingListId },
    transaction
  });
};

export const getAllLoadingOrdersForDelivery = async (page: number, limit: number, clientId: number, filters?: any) => {
  const offset = (page - 1) * limit;
  const whereClause: any = { ...filters };
  if (clientId) whereClause.clientId = clientId;

  if (filters?.deliveryStatus) {
    const { sequelize } = require('../config/database');
    const { Op } = require('sequelize');
    if (filters.deliveryStatus === 'pending') {
      whereClause.id = {
        [Op.notIn]: sequelize.literal(`(
          SELECT da.referenceId FROM delivery_addresses da
          JOIN deliveries d ON da.deliveryId = d.id
          WHERE da.referenceType = 'loadingOrder'
          AND d.status IN ('pending', 'approved', 'started', 'completed')
        )`)
      };
    } else if (filters.deliveryStatus === 'assigned') {
      whereClause.id = {
        [Op.in]: sequelize.literal(`(
          SELECT da.referenceId FROM delivery_addresses da
          JOIN deliveries d ON da.deliveryId = d.id
          WHERE da.referenceType = 'loadingOrder'
          AND d.status IN ('pending', 'approved', 'started')
        )`)
      };
    }
    delete whereClause.deliveryStatus;
  }

  const { rows: data, count: total } = await scoped(models.LoadingOrder).findAndCountAll({
    distinct: true,
    where: whereClause,
    include: [
      {
        model: models.SalesOrder,
        as: 'salesOrder',
        include: [
          { model: models.Customer, as: 'customer' },
          { model: models.Location, as: 'soLocation' },
        ],
      },
      { model: models.PackagingList, as: 'packagingList', include: [{ association: 'shippingAddress' }] },
      {
        association: 'salesOrderProducts',
        required: false,
        include: [{ association: 'inventoryProduct', include: [{ association: 'product', attributes: ['id', 'name', 'isSlabType'] }, { association: 'slab' }] }],
      }
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

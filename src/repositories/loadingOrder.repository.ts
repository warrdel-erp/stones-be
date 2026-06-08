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
                  attributes: ["id", "locationName"],
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
export const getPlNumber = async (clientId: number) => {
  const lastPL: any = await scoped(models.LoadingOrder).findOne({
    where: { clientId },
    order: [["clientLoNumber", "DESC"]],
    attributes: ["clientLoNumber"],
  });

  return { clientLoNumber: lastPL ? lastPL?.clientLoNumber + 1 : 1 };
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

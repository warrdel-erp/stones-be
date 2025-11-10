import { Transaction } from "sequelize";
import * as models from "../models";

// Create new LO
export const createPackagingList = async (data: any, transaction?: Transaction) => {
  return await models.PackagingList.create(data, { transaction });
};

// Get all LO
export const getAllPackagingLists = async () => {
  return await models.PackagingList.findAll({
    include: [{ model: models.LoadingOrder, as: "loadingOrder" }],
  });
};

// Get packaging list by Id
export const getPackagingListById = async (id: number) => {
  return (
    await models.PackagingList.findByPk(id, {
      include: [
        {
          association: "loadingOrder",
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
                  attributes: ["id", "location"],
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
          ],
        },
      ],
    })
  )?.get({ plain: true });
};

// Get packaging list by Id
export const getPackagingListByIdSimple = async (id: number, transaction?: Transaction) => {
  return await models.PackagingList.findByPk(id, { transaction });
};

// Get packaging list by LO id
export const getPackagingListsBySalesOrderId = async (loadingOrderId: number) => {
  return await models.PackagingList.findAll({
    where: { loadingOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
    ],
  });
};

// Update Loading Order
export const updatePackagingList = async (id: number, data: any, transaction?: Transaction) => {
  const packagingList = await models.PackagingList.findByPk(id, { transaction });
  if (!packagingList) return null;

  await packagingList.update(data);
  return packagingList;
};

// Get latest PL number
export const getPlNumber = async (clientId: number) => {
  const lastPL: any = await models.PackagingList.findOne({
    where: { clientId },
    order: [["clientPlNumber", "DESC"]],
    attributes: ["clientPlNumber"],
  });

  return { clientPlNumber: lastPL ? lastPL?.clientPlNumber + 1 : 1 };
};

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
  return await models.PackagingList.findByPk(id, {
    include: [
      { model: models.LoadingOrder, as: "loadingOrder" },
      { model: models.PackagingListProduct, as: "packagingListProducts" },
    ],
  });
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
      { model: models.PackagingListProduct, as: "packagingListProducts" },
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

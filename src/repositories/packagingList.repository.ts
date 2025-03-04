import * as models from "../models";

// Create new LO
export const createPackagingList = async (data: any) => {
  return await models.PackagingList.create(data);
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
export const getPackagingListByIdSimple = async (id: number) => {
  return await models.PackagingList.findByPk(id);
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
export const updatePackagingList = async (id: number, data: any) => {
  const packagingList = await models.PackagingList.findByPk(id);
  if (!packagingList) return null;

  await packagingList.update(data);
  return packagingList;
};

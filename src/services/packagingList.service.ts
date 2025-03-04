import * as packagingListRepository from "../repositories/packagingList.repository";
import * as packagingListProductService from "../services/packagingListProduct.service";

// Create new PL
export const createPackagingList = async (data: any) => {
  let packagingList: any = await packagingListRepository.createPackagingList(data);
  packagingList = packagingList.get({ plain: true });

  if (data?.products) {
    await packagingListProductService.upsertPackagingListProducts(data.products, packagingList.id);
  }

  return packagingList;
};

// Get all PL
export const getAllPackagingLists = async () => {
  return await packagingListRepository.getAllPackagingLists();
};

// Get packaging list by Id
export const getPackagingListById = async (id: number) => {
  return await packagingListRepository.getPackagingListById(id);
};

// Get packaging list by LO id
export const getPackagingListsBySalesOrderId = async (loadingOrderId: number) => {
  return await packagingListRepository.getPackagingListsBySalesOrderId(loadingOrderId);
};

// Update packaging list
export const updatePackagingList = async (id: number, data: any) => {
  return await packagingListRepository.updatePackagingList(id, data);
};

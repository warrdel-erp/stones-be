import * as packagingListRepository from "../repositories/packagingList.repository";
import * as packagingListProductService from "../services/packagingListProduct.service";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { LOADING_ORDER_STAGES } from "../constants/tableTypes";
import { sequelize } from "../config/database";

// Create new PL
export const createPackagingList = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    let packagingList: any = await packagingListRepository.createPackagingList(data, transaction);
    packagingList = packagingList.get({ plain: true });

    if (data?.products) {
      await packagingListProductService.upsertPackagingListProducts(data.products, packagingList.id, transaction);
    }

    await loadingOrderRepository.updateLoadingOrder(
      data.loadingOrderId,
      { stage: LOADING_ORDER_STAGES.PACKAGING_LIST },
      transaction
    );

    transaction.commit();
    return packagingList;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
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

// Get new PL number
export const getPLNumber = async (clientId: number) => {
  return await packagingListRepository.getPlNumber(clientId);
};

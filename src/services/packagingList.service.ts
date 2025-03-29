import * as packagingListRepository from "../repositories/packagingList.repository";
import * as salesOrderProductService from "../services/salesOrderProduct.service";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { LOADING_ORDER_STAGES, SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { sequelize } from "../config/database";

// Create new PL
export const createPackagingList = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    let packagingList: any = await packagingListRepository.createPackagingList(data, transaction);
    packagingList = packagingList.get({ plain: true });

    let updatedProducts = [];

    if (data?.soProducts) {
      // Set loadingOrderId and stage to loadingOrder for each product.
      data.soProducts = data.soProducts.map((e: any) => ({
        ...e,
        packagingListId: packagingList.id,
        stage: SALE_ORDER_PRODUCT_STAGES.PACKAGING_LIST,
      }));

      const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(data.loadingOrderId))?.get({
        plain: true,
      });

      // update sales order products with packaging list id and stage -> packagingList.
      updatedProducts = await salesOrderProductService.upsertSalesOrderProducts(
        data.soProducts,
        loadingOrder.salesOrderId,
        transaction
      );
    }

    // Update loading order stage to packagingList.
    await loadingOrderRepository.updateLoadingOrder(
      data.loadingOrderId,
      { stage: LOADING_ORDER_STAGES.PACKAGING_LIST },
      transaction
    );

    transaction.commit();
    return { packagingList, updatedProducts };
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

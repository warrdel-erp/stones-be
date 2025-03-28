import * as packagingListProductRepository from "../repositories/packagingListProduct.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as loadingOrderProductRepository from "../repositories/loadingOrderProduct.repository";
import * as loadingOrderService from "../services/loadingOrder.service";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { Transaction } from "sequelize";

//  Create or update multiple SalesOrderProduct entries.
export const upsertPackagingListProducts = async (
  products: any[],
  packagingListId: number,
  transaction?: Transaction
) => {
  const upsertedProducts = [];

  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction(); // Start a transaction
  }

  try {
    // Get packaging list by given id
    const packagingList = (await packagingListRepository.getPackagingListByIdSimple(packagingListId, transaction))?.get(
      {
        plain: true,
      }
    );

    if (!packagingList) {
      throw new AppError("Invalid Packaging List Id", 400);
    }

    // Check if loading order is invoiced then can't create packaging list.
    await loadingOrderService.checkIfLoadingOrderInvoiced(
      packagingList.loadingOrderId,
      "add or update packaging list product"
    );

    for (const product of products) {
      if (product.id) {
        // Fetch existing product
        const existingProduct = await packagingListProductRepository.findByIdAndPackagingListId(
          { id: product.id, packagingListId },
          transaction
        );

        if (existingProduct) {
          await packagingListProductRepository.updatePackagingListProduct(product.id, product, transaction);

          upsertedProducts.push({ id: product.id, ...product });
        } else {
          throw new AppError(`Invalid Id '${product.id}' or product does not belongs to given PL`, 400);
        }
      } else {
        const salesOrderProduct = await loadingOrderProductRepository.findByInventoryProductIdAndLoadingOrder({
          inventoryProductId: product.inventoryProductId,
          loadingOrderId: packagingList.loadingOrderId,
        });

        if (!salesOrderProduct) {
          throw new AppError(
            `Inventory Product with ID: ${product.inventoryProductId} is not exists in parent Loading Order, So can't be added in Packaging List`,
            400
          );
        }

        const newProduct = await packagingListProductRepository.createPackagingListProduct(
          { ...product, packagingListId },
          transaction
        );
        upsertedProducts.push(newProduct);
      }
    }

    shouldCommitTransaction && transaction.commit();
    return upsertedProducts;
  } catch (error) {
    shouldCommitTransaction && transaction.rollback();
    throw error;
  }
};

// Fetch all PackagingListProducts linked to a PackagingList
export const getPackagingListProducts = async (packagingListId: number) => {
  return await packagingListProductRepository.getByPackagingListId(packagingListId);
};

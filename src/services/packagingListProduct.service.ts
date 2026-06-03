import * as packagingListProductRepository from "../repositories/packagingListProduct.repository";
import * as packagingListRepository from "../repositories/packagingList.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { PACKAGING_LIST_STAGES } from "../constants/tableTypes";

//  Create or update multiple SalesOrderProduct entries.
export const upsertPackagingListProducts = async (products: any[], packagingListId: number) => {
  const upsertedProducts = [];

  const transaction = await sequelize.transaction();

  try {
    // Create new product entry
    const packagingList = (await packagingListRepository.getPackagingListByIdSimple(packagingListId))?.get({ plain: true });

    if (!packagingList) {
      throw new AppError("Invalid Packaging List Id", 400);
    }

    if (packagingList.stage === PACKAGING_LIST_STAGES.INVOICED) {
      throw new AppError("Cannot add products to Packaging List as it is already invoiced.", 400);
    }

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
          throw new AppError(`Invalid Id '${product.id}' or product does not belong to given Packaging List`, 400);
        }
      } else {
        const salesOrderProduct = await salesOrderProductRepository.findByIdSimple(
          product.salesOrderProductId,
          transaction
        );

        if (!salesOrderProduct) {
          throw new AppError(`Sales order product does not exist with given Id: ${product.salesOrderProductId}`, 400);
        }

        const newProduct = await packagingListProductRepository.createPackagingListProduct(
          {
            ...product,
            packagingListId,
            inventoryProductId: salesOrderProduct.inventoryProductId,
            unitPrice: salesOrderProduct.unitPrice,
          },
          transaction
        );

        upsertedProducts.push(newProduct);
      }
    }

    transaction.commit();
    return upsertedProducts;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Fetch all PackagingListProducts linked to a PackagingList
export const getPackagingListProducts = async (packagingListId: number) => {
  return await packagingListProductRepository.getPackagingListProductsByPackagingListId(packagingListId);
};

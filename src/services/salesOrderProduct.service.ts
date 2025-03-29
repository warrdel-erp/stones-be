import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as soProductSwapHistoryRepository from "../repositories/soProductSwapHistory.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { SLAB_STATUS } from "../constants";
import { Transaction } from "sequelize";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

//  Create or update multiple SalesOrderProduct entries.
export const upsertSalesOrderProducts = async (products: any[], salesOrderId: number, transaction?: Transaction) => {
  const upsertedProducts = [];

  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction();
  }

  try {
    for (const product of products) {
      if (product.id) {
        // Fetch existing product with SOid because update should be happen when product belongs to given SO.
        const existingProduct = await salesOrderProductRepository.findByIdAndSalesOrderId(
          { id: product.id, salesOrderId },
          transaction
        );

        if (existingProduct) {
          // Prevent updating `inventoryProductId` & `salesOrderId`.
          await salesOrderProductRepository.updateSalesOrderProduct(product.id, product, transaction);

          upsertedProducts.push({ id: product.id, ...product });
        } else {
          throw new AppError(`Invalid Id '${product.id}' or product does not belongs to given SO`, 400);
        }
      } else {
        let slab: any = await slabRepository.getSlabByInventoryProductId(product.inventoryProductId);

        slab = slab?.get({ plain: true });

        // can't add to SO if it is not in inventory
        if (slab?.status !== SLAB_STATUS.IN_INVENTORY) {
          throw new AppError(
            `Slab is not in inventory. Slab is ${slab.status} with id: ${slab.id}, and inventoryProductId: ${product.inventoryProductId}`,
            400
          );
        }

        // can't add to SO if it is in hold.
        if (slab?.isHold) {
          throw new AppError(`Slab is in hold with id: ${slab.id}`, 400);
        }

        // Create new product entry.
        const newProduct = await salesOrderProductRepository.createSalesOrderProduct(
          { ...product, salesOrderId },
          transaction
        );

        // If a product is added in SO then status is changed to ALLOCATED for that slab.
        await slabRepository.updateSlabStatusByInventoryProduct(
          product.inventoryProductId,
          SLAB_STATUS.ALLOCATED,
          transaction
        );

        upsertedProducts.push(newProduct);
      }
    }

    if (shouldCommitTransaction) {
      transaction.commit();
    }
    return upsertedProducts;
  } catch (error) {
    if (shouldCommitTransaction) {
      transaction.rollback();
    }
    throw error;
  }
};

// Fetch all SalesOrderProducts linked to a SalesOrder
export const getSalesOrderProducts = async (salesOrderId: number) => {
  return await salesOrderProductRepository.getSalesOrderProductsBySalesOrderId(salesOrderId);
};

export const updatePickedStatus = async (soProductId: number, picked: boolean) => {
  return await salesOrderProductRepository.updatePickedStatus(soProductId, picked);
};

export const swapSalesOrderProduct = async (salesOrderProductId: number, newInventoryProductId: number) => {
  const transaction = await sequelize.transaction();

  try {
    const salesOrderProduct = await salesOrderProductRepository.findByIdSimple(salesOrderProductId);

    if (!salesOrderProduct) {
      throw new Error("Sales Order Product not found.");
    }

    if (salesOrderProduct.picked) {
      throw new Error("Product cannot be swapped as it is already picked.");
    }

    if (salesOrderProduct.stage === SALE_ORDER_PRODUCT_STAGES.INVOICED) {
      throw new Error("Product cannot be swapped as it is already invoiced.");
    }

    // Store Swap History
    await soProductSwapHistoryRepository.createSoProductSwapHistory(
      {
        inventoryProductId: newInventoryProductId,
        salesProductId: salesOrderProductId,
      },
      transaction
    );

    // Update Sales Order Product
    await salesOrderProductRepository.updateSalesOrderProduct(
      salesOrderProductId,
      {
        inventoryProductId: newInventoryProductId,
      },
      transaction
    );

    // set new slab status as ALLOCATED
    await slabRepository.updateSlabStatusByInventoryProduct(newInventoryProductId, SLAB_STATUS.ALLOCATED, transaction);

    // reset old slab status as IN_INVENTORY
    await slabRepository.updateSlabStatusByInventoryProduct(
      salesOrderProduct.inventoryProductId,
      SLAB_STATUS.IN_INVENTORY,
      transaction
    );

    transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

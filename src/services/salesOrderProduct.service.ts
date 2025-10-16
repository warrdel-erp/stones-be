import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as genericProductRepository from "../repositories/genericProduct.repository";
import * as soProductSwapHistoryRepository from "../repositories/soProductSwapHistory.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { Transaction } from "sequelize";
import { LOADING_ORDER_STAGES, SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";

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
        // Check if it's a slab or generic product
        let slab: any = await slabRepository.getSlabByInventoryProductId(product.inventoryProductId);
        let genericProduct: any = null;

        if (slab) {
          slab = slab?.get({ plain: true });
        } else {
          // If not a slab, check if it's a generic product
          genericProduct = await genericProductRepository.getGenericProductByInventoryProductId(
            product.inventoryProductId,
            transaction
          );
        }

        // can't add to SO if it is not in inventory
        if (slab && slab.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
          throw new AppError(
            `Slab is not in inventory. Slab is ${slab.status} with id: ${slab.id}, and inventoryProductId: ${product.inventoryProductId}`,
            400
          );
        }

        if (genericProduct && genericProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
          throw new AppError(
            `Generic product is not in inventory. Generic product is ${genericProduct.status} with id: ${genericProduct.id}, and inventoryProductId: ${product.inventoryProductId}`,
            400
          );
        }

        // can't add to SO if it is in hold (check inventoryProduct hold)
        const inv = await inventoryProductRepository.findInventoryProductById(product.inventoryProductId);
        if (inv && (inv as any).isHold) {
          throw new AppError(`Inventory product is on hold for inventoryProductId: ${product.inventoryProductId}`, 400);
        }

        // Create new product entry.
        const newProduct = await salesOrderProductRepository.createSalesOrderProduct(
          { ...product, salesOrderId },
          transaction
        );

        // If a product is added in SO then status is changed to ALLOCATED
        if (slab) {
          await slabRepository.updateSlabStatusByInventoryProduct(
            product.inventoryProductId,
            INVENTORY_ITEM_STATUS.ALLOCATED,
            transaction,
            { isInCart: false }
          );
        } else if (genericProduct) {
          await genericProductRepository.updateGenericProductStatusByInventoryProduct(
            product.inventoryProductId,
            INVENTORY_ITEM_STATUS.ALLOCATED,
            transaction
          );
        }

        // Update inventory product status to ALLOCATED
        await inventoryProductRepository.updateInventoryProductStatusById(
          product.inventoryProductId,
          INVENTORY_ITEM_STATUS.ALLOCATED,
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
  const soProduct = await salesOrderProductRepository.getSOproductWithSOAndLO(soProductId);

  if (!soProduct) {
    throw new AppError("Sales Order Product not found.", 400);
  }

  // If sales order is not in PENDING status, it can't be picked.
  if (soProduct.salesOrder.status !== SALES_ORDER_STATUS.OPEN) {
    throw new AppError(`Loading Order is in ${soProduct.saleOrder.status}. So product can't be picked.`, 400);
  }

  // If sales order is not in PENDING status, it can't be picked.
  if (soProduct.stage.status === SALE_ORDER_PRODUCT_STAGES.INVOICED) {
    throw new AppError(`Product is already invoiced. So product can't be picked`, 400);
  }

  return await salesOrderProductRepository.updatePickedStatus(soProductId, picked);
};

export const swapSalesOrderProduct = async (salesOrderProductId: number, data: any) => {
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
        ...salesOrderProduct,
        salesProductId: salesOrderProductId,
      },
      transaction
    );

    // Update Sales Order Product
    await salesOrderProductRepository.updateSalesOrderProduct(salesOrderProductId, data, transaction);

    // set new slab status as ALLOCATED
    await slabRepository.updateSlabStatusByInventoryProduct(
      data.newInventoryProductId,
      INVENTORY_ITEM_STATUS.ALLOCATED,
      transaction
    );
    await inventoryProductRepository.updateInventoryProductStatusById(
      data.newInventoryProductId,
      INVENTORY_ITEM_STATUS.ALLOCATED,
      transaction
    );

    // reset old slab status as IN_INVENTORY
    await slabRepository.updateSlabStatusByInventoryProduct(
      salesOrderProduct.inventoryProductId,
      INVENTORY_ITEM_STATUS.IN_INVENTORY,
      transaction
    );
    await inventoryProductRepository.updateInventoryProductStatusById(
      salesOrderProduct.inventoryProductId,
      INVENTORY_ITEM_STATUS.IN_INVENTORY,
      transaction
    );

    transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as salesOrderRepository from '../repositories/salesOrder.repository'
import * as soProductSwapHistoryRepository from "../repositories/soProductSwapHistory.repository";
import * as inventoryProductHoldRepository from "../repositories/inventoryProductHold.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS, SALES_TAX } from "../constants";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { Transaction } from "sequelize";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";


// Create multiple SalesOrderProduct entries
export const createSalesOrderProducts = async (products: any[], salesOrderId: number, transaction?: Transaction) => {
  const createdProducts = [];

  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction();
  }

  try {
    for (const product of products) {
      const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(product.inventoryProductId);

      // can't add to SO if it is in hold (check inventoryProduct hold)
      const hold = await inventoryProductHoldRepository.findHoldByInventoryProductId(product.inventoryProductId, transaction);
      if (hold) {
        throw new AppError(`Inventory product is on hold for inventoryProductId: ${product.inventoryProductId}`, 400);
      }

      if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
        throw new AppError(`Inventory product is not in inventory. Inventory product is ${inventoryProduct.status} with id: ${inventoryProduct.id}, and inventoryProductId: ${product.inventoryProductId}`, 400);
      }

      // Calculate receivingAreaSqFt if it's a slab type
      let receivingAreaSqFt = null;
      if (inventoryProduct.isSlabType) {
        const slab: any = await slabRepository.getSlabByInventoryProductId(product.inventoryProductId);
        if (slab) {
          receivingAreaSqFt = slab.receivedSqrFt;
        }
      }

      const salesOrder: any = await salesOrderRepository.getSimpleSalesOrder(salesOrderId, transaction)

      // Create new sales order product entry
      const newProduct = await salesOrderProductRepository.createSalesOrderProduct(
        {
          ...product,
          salesOrderId,
          isSlabType: inventoryProduct.isSlabType,
          taxPercentage: product.taxApplied ? SALES_TAX.find((e) => e.id == salesOrder?.taxId)?.value : 0,
          receivingAreaSqFt
        },
        transaction
      );

      // Update inventory product status to ALLOCATED
      await inventoryProductRepository.updateInventoryProductStatusById(
        product.inventoryProductId,
        INVENTORY_ITEM_STATUS.ALLOCATED,
        transaction
      );

      createdProducts.push(newProduct);
    }

    if (shouldCommitTransaction) {
      await transaction.commit();
    }
    return createdProducts;
  } catch (error) {
    if (shouldCommitTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

// Update multiple SalesOrderProduct entries
export const updateSalesOrderProducts = async (products: any[], transaction?: Transaction) => {
  const updatedProducts = [];

  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction();
  }

  try {
    for (const product of products) {
      if (!product.id) {
        throw new AppError("Product id is required for update", 400);
      }

      // Fetch existing product with SOid because update should happen when product belongs to given SO
      const existingProduct = await salesOrderProductRepository.findByIdSimple(
        product.id,
        transaction
      );

      if (!existingProduct) {
        throw new AppError(`Invalid Id '${product.id}' or so product does not exists`, 400);
      }

      // Prevent updating `inventoryProductId` & `salesOrderId`
      await salesOrderProductRepository.updateSalesOrderProduct(product.id, product, transaction);

      updatedProducts.push({ id: product.id, ...product });
    }

    if (shouldCommitTransaction) {
      await transaction.commit();
    }
    return updatedProducts;
  } catch (error) {
    if (shouldCommitTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

// Fetch all SalesOrderProducts linked to a SalesOrder
export const getSalesOrderProducts = async (salesOrderId: number) => {
  return await salesOrderProductRepository.getSalesOrderProductsBySalesOrderId(salesOrderId);
};

// Validate that all sales order product IDs exist and belong to the same sales order
export const validateSalesOrderProducts = async (soProducts: any[]) => {
  if (!soProducts || soProducts.length === 0) {
    throw new AppError("Sales order products are required", 400);
  }

  // Extract IDs from the objects
  const soProductIds = soProducts.map(product => product.id).filter(id => id);

  // Check if all products have IDs
  const productsWithoutId = soProducts.filter(product => !product.id);
  if (productsWithoutId.length > 0) {
    throw new AppError("All sales order products must have an id", 400);
  }

  // Fetch all products by IDs
  const fetchedProducts = await Promise.all(
    soProductIds.map(id => salesOrderProductRepository.findByIdSimple(id))
  );

  // Check if all products exist
  const notFoundIds = soProductIds.filter((_, index) => !fetchedProducts[index]);
  if (notFoundIds.length > 0) {
    throw new AppError(`Sales order products not found: ${notFoundIds.join(", ")}`, 404);
  }

  // Extract salesOrderIds from all products
  const salesOrderIds = fetchedProducts.map((product: any) => product.salesOrderId);
  const uniqueSalesOrderIds = [...new Set(salesOrderIds)];

  // Check if all products belong to the same sales order
  if (uniqueSalesOrderIds.length > 1) {
    throw new AppError(
      `Sales order products belong to different sales orders: ${uniqueSalesOrderIds.join(", ")}`,
      400
    );
  }

  const salesOrderId = uniqueSalesOrderIds[0];

  return {
    salesOrderId
  };
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
    const { id, ...salesOrderProduct } = await salesOrderProductRepository.findByIdSimple(salesOrderProductId);

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
    await salesOrderProductRepository.updateSalesOrderProduct(salesOrderProductId, { ...data, inventoryProductId: data.newInventoryProductId }, transaction);

    // set new inventory product status as ALLOCATED
    await inventoryProductRepository.updateInventoryProductStatusById(
      data.newInventoryProductId,
      INVENTORY_ITEM_STATUS.ALLOCATED,
      transaction
    );

    // reset old inventory product status as IN_INVENTORY
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

export const getSwapHistory = async (salesOrderProductId: number) => {
  // Verify that the sales order product exists
  const salesOrderProduct = await salesOrderProductRepository.findByIdSimple(salesOrderProductId);

  if (!salesOrderProduct) {
    throw new AppError("Sales Order Product not found", 404);
  }

  // Get swap history
  const swapHistory = await soProductSwapHistoryRepository.getSwapHistoryBySalesProductId(salesOrderProductId);

  return swapHistory;
};

export const deleteSalesOrderProduct = async (soProductId: number) => {
  const transaction = await sequelize.transaction();

  try {
    // Find the sales order product
    const salesOrderProduct = await salesOrderProductRepository.findByIdSimple(soProductId, transaction);

    if (!salesOrderProduct) {
      throw new AppError("Sales Order Product not found", 404);
    }

    // Only allow deletion if stage is "saleOrder"
    if (salesOrderProduct.stage !== SALE_ORDER_PRODUCT_STAGES.SALES_ORDER) {
      throw new AppError(
        `Cannot delete sales order product. Current stage is "${salesOrderProduct.stage}". Deletion is only allowed when stage is "saleOrder".`,
        400
      );
    }

    // Revert inventory product status back to IN_INVENTORY
    await inventoryProductRepository.updateInventoryProductStatusById(
      salesOrderProduct.inventoryProductId,
      INVENTORY_ITEM_STATUS.IN_INVENTORY,
      transaction
    );

    // Delete the sales order product
    await salesOrderProductRepository.deleteSalesOrderProduct(soProductId, transaction);

    await transaction.commit();

    return { message: "Sales Order Product deleted successfully" };
  } catch (error: any) {
    await transaction.rollback();
    throw error;
  }
};

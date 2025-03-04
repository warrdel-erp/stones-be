import * as loadingOrderProductRepository from "../repositories/loadingOrderProduct.repository";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";

//  Create or update multiple SalesOrderProduct entries.
export const upsertLoadingOrderProducts = async (products: any[], loadingOrderId: number) => {
  const upsertedProducts = [];

  const transaction = await sequelize.transaction();

  try {
    // Create new product entry
    const loadingOrder = (await loadingOrderRepository.getLoadingOrderByIdSimple(loadingOrderId))?.get({ plain: true });

    if (!loadingOrder) {
      throw new AppError("Invalid Loading Order Id", 400);
    }

    if (loadingOrder.invoiced) {
      throw new AppError("Cannot add products to Loading Order as it is already invoiced.", 400);
    }

    for (const product of products) {
      if (product.id) {
        // Fetch existing product
        const existingProduct = await loadingOrderProductRepository.findByIdAndLoadingOrderId(
          { id: product.id, loadingOrderId },
          transaction
        );

        if (existingProduct) {
          await loadingOrderProductRepository.updateLoadingOrderProduct(product.id, product, transaction);

          upsertedProducts.push({ id: product.id, ...product });
        } else {
          throw new AppError(`Invalid Id '${product.id}' or product does not belongs to given LO`, 400);
        }
      } else {
        const salesOrderProduct = await salesOrderProductRepository.findByInventoryProductIdAndSalesOrderId({
          inventoryProductId: product.inventoryProductId,
          salesOrderId: loadingOrder.salesOrderId,
        });

        if (!salesOrderProduct) {
          throw new AppError(
            `Inventory Product with ID: ${product.inventoryProductId} is not exists in parent Sales Order, So can't be added in Loading Order`,
            400
          );
        }

        const newProduct = await loadingOrderProductRepository.createLoadingOrderProduct(
          { ...product, loadingOrderId },
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

// Fetch all LoadingOrderProducts linked to a LoadingOrder
export const getLoadingOrderProducts = async (loadingOrderId: number) => {
  return await loadingOrderProductRepository.getLoadingOrderProductsByLoadingOrderId(loadingOrderId);
};

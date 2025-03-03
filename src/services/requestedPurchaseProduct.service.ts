import { AppError } from "../helper/appError";
import * as requestedPurchaseProductRepository from "../repositories/requestedPurchaseProduct.repository";

export const upsertRequestedPurchaseProducts = async (products: Array<any>, purchaseOrderId: number) => {
  const upsertedProducts = [];

  for (const product of products) {
    if (product.id) {
      // Check if product exists
      const existingProduct = await requestedPurchaseProductRepository.findById(product.id);

      if (existingProduct) {
        // Update existing product (productId & purchaseOrderId will be protected by the model hook)
        await requestedPurchaseProductRepository.updateProduct(product.id, product);
        upsertedProducts.push(existingProduct);
      } else {
        throw new AppError(`Invalid Id '${product.id}'`, 400);
      }
    } else {
      // Create new product
      const newProduct = await requestedPurchaseProductRepository.createProduct({
        ...product,
        purchaseOrderId,
      });
      upsertedProducts.push(newProduct);
    }
  }

  return upsertedProducts;
};

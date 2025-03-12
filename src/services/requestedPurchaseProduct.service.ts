import { AppError } from "../helper/appError";
import * as requestedPurchaseProductRepository from "../repositories/requestedPurchaseProduct.repository";

export const upsertRequestedPurchaseProducts = async (products: Array<any>, purchaseOrderId: number) => {
  const upsertedProducts = [];

  for (const product of products) {
    if (product.id) {
      // Check if product exists
      const existingProduct = await requestedPurchaseProductRepository.findById(product.id);

      if (!existingProduct) {
        throw new AppError(`Invalid Id '${product.id}'`, 400);
      }

      if (existingProduct.siplProducts.length && product.productId != existingProduct.productId) {
        throw new AppError(
          `SIPL product is been created against requested product '${product.id}' So It's product could not be changed.`,
          400
        );
      }

      // Update existing product (productId & purchaseOrderId will be protected by the model hook)
      await requestedPurchaseProductRepository.updateProduct(product.id, product);
      upsertedProducts.push(existingProduct);
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

// Delete requested purchase product
export const deleteRequestedPurchaseProduct = async (id: number) => {
  const product = await requestedPurchaseProductRepository.findById(id);

  if (!product) {
    throw new Error("Requested purchase product not found");
  }

  const data = await requestedPurchaseProductRepository.deleteProductById(id);

  return data;
};

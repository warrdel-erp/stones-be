import { AppError } from "../helper/appError";
import * as productRepository from "../repositories/product.repository";

// Create a new product.
export const addProduct = async (productData: any, userId: number) => {
  // Append created by and updated by as userId
  return await productRepository.createProduct({ productData, createdBy: userId, updatedBy: userId });
};

// Fetch all products
export const fetchAllProducts = async (page: number, limit: number, search?: string) => {
  return productRepository.getAllProducts(page, limit, search);
};

// Update product details
export const modifyProduct = async (productId: number, updateData: any, userId: number) => {
  // update product
  const updatedProduct = productRepository.updateProduct(productId, updateData, userId);

  if (!updatedProduct) throw new AppError("User not found or update failed", 400);
  return updatedProduct;
};

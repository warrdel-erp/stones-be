import { AppError } from "../helper/appError";
import * as productRepository from "../repositories/product.repository";

export const addProduct = async (productData: any) => {
  return await productRepository.createProduct(productData);
};

// Fetch all products
export const fetchAllProducts = async (page: number, limit: number, search?: string) => {
  return productRepository.getAllProducts(page, limit, search);
};

// Update product details
export const modifyProduct = async (id: number, updateData: any) => {
  const updatedProduct = productRepository.updateProduct(id, updateData);
  if (!updatedProduct) throw new AppError("User not found or update failed", 400);
  return updatedProduct;
};

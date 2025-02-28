import { createProduct } from "../repositories/product.repository";

export const addProduct = async (productData: any) => {
  return await createProduct(productData);
};

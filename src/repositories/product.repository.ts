import Product from "../models/product";

export const createProduct = async (productData: any) => {
  return await Product.create(productData);
};

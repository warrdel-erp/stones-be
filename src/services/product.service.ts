import { PRODUCT_KIND, THICKNESS, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import { AppError } from "../helper/appError";
import * as productRepository from "../repositories/product.repository";
import * as slabRepository from "../repositories/slab.repository";

// Create a new product.
export const addProduct = async (productData: any, userId: number) => {
  // Append created by and updated by as userId
  return await productRepository.createProduct({ ...productData, createdBy: userId, updatedBy: userId });
};

// Fetch all products
export const fetchAllProducts = async (page: number, limit: number, search?: string) => {
  let products = await productRepository.getAllProducts(page, limit, search);

  products.products = products.products.map((product: any) => {
    product = product.get({ plain: true });

    product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
    product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
    product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom)?.name;

    return product;
  });

  return products;
};

// Update product details
export const modifyProduct = async (productId: number, updateData: any, userId: number) => {
  // update product
  const updatedProduct = productRepository.updateProduct(productId, updateData, userId);

  if (!updatedProduct) throw new AppError("User not found or update failed", 400);
  return updatedProduct;
};

// Get product by id
export const fetchProductById = async (id: number) => {
  let product: any = await productRepository.getProductById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product = product.get({ plain: true });

  product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
  product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
  product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom)?.name;
  product.thickness = THICKNESS.find((e) => e.id == product.thickness)?.value;

  product.inventoryBalance = await getInventoryBalance(id);

  return product;
};

// get inventory balance.
export const getInventoryBalance = async (productId: number) => {
  const inStock = await slabRepository.getInStockSlabsData(productId);
  const allocatedHold = await slabRepository.getAllocatedHoldSlabsData(productId);

  return {
    inStock,
    allocatedHold,
  };
};

import { PRODUCT_KIND, THICKNESS, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import { AppError } from "../helper/appError";
import * as productRepository from "../repositories/product.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";

// Create a new product.
export const addProduct = async (productData: any, userId: number, clientId: number) => {
  // Get ledger account for finished goods.
  const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
  });

  const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
    clientId,
  });

  const incomeAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
    clientId,
  });

  // Append created by and updated by as userId
  return await productRepository.createProduct({
    ...productData,
    createdBy: userId,
    updatedBy: userId,
    inventoryLinkAccountId: ledgerAccountForFinishedGoods.id,
    incomeAccountId: incomeAccount.id,
    costOfGoodsAccountId: ledgerAccountForCogs.id,
  });
};

// Fetch all products with minimal data
export const fetchAllProducts = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any
) => {
  return await productRepository.getAllProductsMinimal(page, limit, search, filter);
};

// Fetch all products
export const fetchAllProductsWithCompactData = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any,
  onlyWithSlabs?: boolean
) => {
  let products = await productRepository.getAllProductsWithCompactData(page, limit, search, filter, onlyWithSlabs);

  products.products = products.products.map((product: any) => {

    product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
    product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
    product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom);

    return product;
  });

  return products;
};

// Fetch all products
export const fetchProductsDataByTabs = async (tab: string, productId: number) => {
  let data: any[] = [];

  if (tab.toLowerCase() === "inventory") {
    data = await slabRepository.getAllSlabs({ productId });
  }

  return data;
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
  const available = await slabRepository.getAvailableSlabsData(productId);

  return {
    inStock,
    allocatedHold,
    available,
  };
};

export const productLandedCosts = async (productId: number) => {
  const averageLandedCost = await inventoryProductRepository.getAverageLandedCost(productId);
  const lastLandedCost = await inventoryProductRepository.getLastLandedCost(productId);
  return { ...averageLandedCost, lastLandedCost: lastLandedCost?.dataValues.landedUnitCost };
}; 
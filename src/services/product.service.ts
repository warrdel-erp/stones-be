import { INVENTORY_ITEM_STATUS, PRODUCT_KIND, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as productRepository from "../repositories/product.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import _ from "lodash";
import * as XLSX from "xlsx";
import { productSchema } from "../validators/product.validator";
import * as models from "../models";
import * as s3FileService from "./s3File.service";
import { generateSignedGetUrl } from "./s3File.service";

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

    product = product.get({ plain: true });

    const totalAvailableQuantity = (
      _.sumBy(product?.inventoryProducts, (item: any) => item.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold ? item.slab?.receivingLength * item.slab?.receivingWidth : 0)
      / 144
    ).toFixed(2)

    const totalAvailableUnits = product?.inventoryProducts?.filter((item: any) => item.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold).length;

    return {
      ...product,
      totalAvailableQuantity,
      totalAvailableUnits,
    }
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

  product.inventoryBalance = await getInventoryBalance(id);

  // Fetch product images and sign them
  product.images = await getProductImages(id);

  return product;
};

// get inventory balance.
export const getInventoryBalance = async (productId: number) => {
  const inStock = await slabRepository.getInStockSlabsData(productId);
  const allocated = await slabRepository.getAllocatedSlabsData(productId);
  const hold = await slabRepository.getHoldSlabsData(productId);
  const available = await slabRepository.getAvailableSlabsData(productId);

  return {
    inStock,
    allocated,
    hold,
    available,
  };
};

export const productLandedCosts = async (productId: number) => {
  const averageLandedCost = await inventoryProductRepository.getAverageLandedCost(productId);
  const lastLandedCost = await inventoryProductRepository.getLastLandedCost(productId);
  return { ...averageLandedCost, lastLandedCost: lastLandedCost?.dataValues.landedUnitCost };
};

export const fetchProductsWithEmptyBinInventory = async (page: number, limit: number) => {
  return await productRepository.getProductsWithEmptyBinInventory(page, limit);
};

export const addProductImage = async (productId: number, s3FileId: number) => {
  const product = await productRepository.getProductByIdSimple(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const image = await models.ProductImage.create({
    productId,
    s3FileId,
  });

  return image;
};

export const deleteProductImage = async (imageId: number) => {
  const transaction = await sequelize.transaction();
  try {
    const imageLink = await models.ProductImage.findByPk(imageId, { transaction });

    if (!imageLink) {
      throw new AppError("Image not found", 404);
    }

    const s3FileId = (imageLink as any).s3FileId;

    await imageLink.destroy({ transaction });

    if (s3FileId) {
      await s3FileService.deleteS3File(s3FileId, transaction);
    }

    await transaction.commit();
    return { message: "Image deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getProductImages = async (productId: number) => {
  const images = await models.ProductImage.findAll({
    where: { productId },
    include: [{ model: models.S3File, as: 's3File' }],
  });

  const plainImages = images.map((img) => img.get({ plain: true }));

  await Promise.all(
    plainImages.map(async (img: any) => {
      if (img.s3File?.s3Bucket && img.s3File?.s3Key) {
        img.s3File.url = await generateSignedGetUrl(img.s3File.s3Bucket, img.s3File.s3Key);
      }
    })
  );

  return plainImages;
};



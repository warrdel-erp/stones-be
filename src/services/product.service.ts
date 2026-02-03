import { INVENTORY_ITEM_STATUS, PRODUCT_KIND, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import { AppError } from "../helper/appError";
import * as productRepository from "../repositories/product.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import _ from "lodash";
import csv from "csv-parser";
import { Readable } from "stream";
import { productSchema } from "../validators/product.validator";
import * as models from "../models";
import { scoped } from "../utils/scoped";

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

export const fetchProductsWithEmptyBinInventory = async (page: number, limit: number) => {
  return await productRepository.getProductsWithEmptyBinInventory(page, limit);
};

/**
 * Validates all referenced IDs in the CSV data to ensure they exist and belong to the client.
 * Also ensures product names are unique for the client within the CSV and database.
 */
const validateBulkProductIdsAndUniqueness = async (csvRows: any[], clientId: number) => {
  const errors: string[] = [];
  const uniqueIds = {
    baseColorIds: new Set<number>(),
    groupIds: new Set<number>(),
    subCategoryIds: new Set<number>(),
    finishIds: new Set<number>(),
    binIds: new Set<number>(),
    kindIds: new Set<number>(),
    uomIds: new Set<number>(),
    originIds: new Set<number>(),
  };

  const productNamesInCsv = new Set<string>();
  const duplicateNamesInCsv = new Set<string>();
  const subCategorySlabTypeMap = new Map<number, boolean>();

  csvRows.forEach(row => {
    // Collect Name for Uniqueness check
    const name = (row.name || row.Name || "").trim();
    if (name) {
      if (productNamesInCsv.has(name.toLowerCase())) {
        duplicateNamesInCsv.add(name);
      }
      productNamesInCsv.add(name.toLowerCase());
    }

    // Collect IDs for Existence check
    if (row.baseColorId) uniqueIds.baseColorIds.add(Number(row.baseColorId));
    if (row.groupId) uniqueIds.groupIds.add(Number(row.groupId));
    if (row.subCategoryId) uniqueIds.subCategoryIds.add(Number(row.subCategoryId));
    if (row.finishId) uniqueIds.finishIds.add(Number(row.finishId));
    if (row.binId) uniqueIds.binIds.add(Number(row.binId));
    if (row.kindId) uniqueIds.kindIds.add(Number(row.kindId));
    if (row.uomId) uniqueIds.uomIds.add(Number(row.uomId));
    if (row.originId) uniqueIds.originIds.add(Number(row.originId));
  });

  // 1. Check for duplicates within the CSV itself
  duplicateNamesInCsv.forEach(name => {
    errors.push(`Duplicate product name found in CSV: "${name}"`);
  });

  const validateInDb = async (model: any, ids: Set<number>, name: string, attributes: string[] = ['id']) => {
    if (ids.size === 0) return [];
    const found = await scoped(model).findAll({
      where: { id: Array.from(ids), clientId },
      attributes
    });
    const foundIds = new Set(found.map((item: any) => item.id));
    ids.forEach(id => {
      if (!foundIds.has(id)) {
        errors.push(`Invalid ${name} ID: ${id}`);
      }
    });
    return found;
  };

  const validateInConstant = (constant: readonly any[], ids: Set<number>, name: string) => {
    const validIds = new Set(constant.map(item => item.id));
    ids.forEach(id => {
      if (!validIds.has(id)) {
        errors.push(`Invalid ${name} ID: ${id}`);
      }
    });
  };

  // 2. Check for duplicate names in database for this client
  const checkDuplicateNamesInDb = async () => {
    if (productNamesInCsv.size === 0) return;
    const existingProducts = await scoped(models.Product).findAll({
      where: {
        name: Array.from(productNamesInCsv),
        clientId
      },
      attributes: ['name']
    });

    existingProducts.forEach((p: any) => {
      errors.push(`Product name already exists in database: "${p.name}"`);
    });
  };

  const [subCategories] = await Promise.all([
    validateInDb(models.ProductSubCategory, uniqueIds.subCategoryIds, "Subcategory", ['id', 'isSlabType']),
    validateInDb(models.ProductBaseColor, uniqueIds.baseColorIds, "Base Color"),
    validateInDb(models.ProductGroup, uniqueIds.groupIds, "Category/Group"),
    validateInDb(models.ProductFinish, uniqueIds.finishIds, "Finish"),
    validateInDb(models.Bin, uniqueIds.binIds, "Bin"),
    checkDuplicateNamesInDb(),
  ]);

  subCategories.forEach((sc: any) => {
    subCategorySlabTypeMap.set(sc.id, sc.isSlabType);
  });

  validateInConstant(PRODUCT_KIND, uniqueIds.kindIds, "Kind");
  validateInConstant(UNITS_OF_MEASUREMENT, uniqueIds.uomIds, "UOM");
  validateInConstant(COUNTRIES, uniqueIds.originIds, "Origin");

  if (errors.length > 0) {
    throw new AppError(`Bulk Validation failed:\n${errors.join('\n')}`, 400);
  }

  return { subCategorySlabTypeMap };
};

/**
 * Parses and processes CSV rows, applying Zod validation and mapping to DB format.
 * Also performs cross-field validation for isSlabType consistency.
 */
const prepareBulkProductData = (
  csvRows: any[],
  userId: number,
  clientId: number,
  ledgerAccounts: any,
  subCategoryIdMap: Map<number, boolean>
) => {
  const products: any[] = [];
  const errors: string[] = [];

  csvRows.forEach((data) => {
    const rowNum = data._rowNumber;
    const subCategoryId = data.subCategoryId ? Number(data.subCategoryId) : null;

    // Derive isSlabType and uomId from Subcategory
    let isSlabType = false;
    let uomId = 14; // Default to EA

    if (subCategoryId !== null && subCategoryIdMap.has(subCategoryId)) {
      isSlabType = subCategoryIdMap.get(subCategoryId) || false;
      uomId = isSlabType ? 1 : 14; // SF (1) for slabs, EA (14) for others
    }

    const inputData = {
      name: (data.name || data.Name || "").trim(),
      alternativeName: data.alternativeName || data.AlternativeName || null,
      baseColorId: data.baseColorId ? Number(data.baseColorId) : null,
      groupId: data.groupId ? Number(data.groupId) : null,
      subCategoryId: subCategoryId,
      originId: data.originId ? Number(data.originId) : null,
      uomId: uomId,
      weight: data.weight ? parseFloat(data.weight) : null,
      finishId: data.finishId ? Number(data.finishId) : null,
      kindId: data.kindId ? Number(data.kindId) : null,
      thickness: data.thickness ? parseFloat(data.thickness) : null,
      notes: data.notes || null,
      specialInstruction: data.specialInstruction || null,
      disclaimer: data.disclaimer || null,
      isSlabType: isSlabType,
      singleUnitPrice: data.singleUnitPrice ? parseFloat(data.singleUnitPrice) : null,
      bundlePrice: data.bundlePrice ? parseFloat(data.bundlePrice) : null,
      reorderQuantity: data.reorderQuantity ? parseFloat(data.reorderQuantity) : null,
      safetyQuantity: data.safetyQuantity ? parseFloat(data.safetyQuantity) : null,
      binId: data.binId ? Number(data.binId) : null,
      status: data.status || "active",
    };

    const validation = productSchema.safeParse(inputData);

    if (!validation.success) {
      const rowErrors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      errors.push(`Row ${rowNum}: ${rowErrors}`);
    } else {
      products.push({
        ...validation.data,
        createdBy: userId,
        updatedBy: userId,
        clientId,
        inventoryLinkAccountId: ledgerAccounts.inventoryLinkAccountId,
        incomeAccountId: ledgerAccounts.incomeAccountId,
        costOfGoodsAccountId: ledgerAccounts.costOfGoodsAccountId,
      });
    }
  });

  if (errors.length > 0) {
    throw new AppError(`Validation failed for some rows: \n${errors.join('\n')}`, 400);
  }

  return products;
};

/**
 * Entry point for bulk product upload.
 */
export const bulkUploadProducts = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  const csvRows: any[] = [];
  let rowNumber = 1;

  // 1. Get default ledger accounts
  const [ledgerAccountForFinishedGoods, ledgerAccountForCogs, incomeAccount] = await Promise.all([
    ledgerAccountRepository.getLedgerAccountByFilter({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS, clientId }),
    ledgerAccountRepository.getLedgerAccountByFilter({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS, clientId }),
    ledgerAccountRepository.getLedgerAccountByFilter({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD, clientId }),
  ]);

  if (!ledgerAccountForFinishedGoods || !ledgerAccountForCogs || !incomeAccount) {
    throw new AppError("Default ledger accounts not configured for this client.", 400);
  }

  // 2. Parse CSV
  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    stream
      .pipe(csv())
      .on("data", (data) => csvRows.push({ ...data, _rowNumber: ++rowNumber }))
      .on("end", resolve)
      .on("error", reject);
  });

  if (csvRows.length === 0) {
    throw new AppError("No products found in the CSV file.", 400);
  }

  // 3. Separate Function: Validate IDs and Name Uniqueness (Existence and Scope)
  const { subCategorySlabTypeMap } = await validateBulkProductIdsAndUniqueness(csvRows, clientId);

  // 4. Separate Function: Prepare and Validate row data
  const products = prepareBulkProductData(csvRows, userId, clientId, {
    inventoryLinkAccountId: ledgerAccountForFinishedGoods.id,
    incomeAccountId: incomeAccount.id,
    costOfGoodsAccountId: ledgerAccountForCogs.id,
  }, subCategorySlabTypeMap);

  // 5. Bulk Create
  const createdProducts = await productRepository.bulkCreateProducts(products);

  return { createdProductsCount: createdProducts.length };
};

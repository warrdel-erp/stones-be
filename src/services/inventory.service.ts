import _ from "lodash";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as productRepository from "../repositories/product.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as decimal from '../helper/decimal'
import { AuthRequest } from "../middleware/authMiddleware";
import * as models from "../models";
import { generateSignedGetUrl } from "./s3File.service";

export const fetchProductsWithSlabsByLocationGroupedBySipl = async (
  req: AuthRequest,
  page: number,
  limit: number,
  locationId: number,
  isSlabType?: boolean,
  search?: string,
  subCategory?: string
) => {
  const filter: any = {};
  if (isSlabType !== undefined) {
    filter.isSlabType = isSlabType;
  }
  if (subCategory !== undefined) {
    filter["$subCategory.name$"] = subCategory;
  }
  const data: any = await productRepository.getAllProducts(page, limit, search, Object.keys(filter).length ? filter : undefined, true);

  // Map data accordingly product -> sipl -> slab
  let finalData = await Promise.all(
    data.products.map(async (product: any) => {

      product.sipls = await siplRepository.getSIPLByProduct(req, product.id, locationId);

      if (!product.sipls.length) {
        return undefined;
      }

      await Promise.all(
        product.sipls.map(async (sipl: any, index: number) => {
          const totalArea: any = await slabRepository.getTotalAreaBySIPL(sipl.id);
          product.sipls[index] = sipl.get({ plain: true });
          product.sipls[index].totalArea = totalArea[0]?.totalArea;
        })
      );

      // Calculate totalQuantity by summing area of all inventoryProducts (per slab), using product.inventoryProducts
      let totalAvailableQuantity = 0;
      let totalAvailableQuantityUnit = 0;

      const availableItems = (product?.inventoryProducts || []).filter((item: any) =>
        item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
      );

      if (product.isSlabType) {
        const available = availableItems.map((item: any) => item?.slab?.receivedSqrFt || 0);
        totalAvailableQuantity = decimal.decimalSum(available);
        totalAvailableQuantityUnit = availableItems.length;
      } else {
        totalAvailableQuantity = availableItems.length;
        totalAvailableQuantityUnit = availableItems.length;
      }

      const totalSlabsCount = _.flatMap(product.sipls, 'inventoryProducts').length;

      const holds = product?.inventoryProducts?.map((e: any) => e.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && e.hold ? (e.isSlabType ? e.slab?.receivedSqrFt : 1) : 0);

      let totalHoldQuantity = 0;
      let totalHoldQuantityUnit = 0;

      if (holds) {
        totalHoldQuantity = (decimal.decimalSum(holds));
        totalHoldQuantityUnit = holds.filter(Boolean).length
      }

      // Total units
      product.totalUnits = product?.inventoryProducts?.find((e: any) => e.status == INVENTORY_ITEM_STATUS.IN_INVENTORY)?.length;

      delete product.inventoryProducts;

      if (product.images && product.images.length > 0) {
        const primaryImg = product.images[0];
        if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
          primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
        }
        product.primaryImage = primaryImg;
      } else {
        product.primaryImage = null;
      }
      delete product.images;

      return { ...product, totalAvailableQuantity, totalAvailableQuantityUnit, totalSlabsCount, totalHoldQuantity, totalHoldQuantityUnit };
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

export const fetchProductsWithSlabsByLocationGroupedByBlock = async (
  page: number,
  limit: number,
  locationId: number,
  isSlabType?: boolean,
  search?: string,
  subCategory?: string
) => {
  const filter: any = {};
  if (isSlabType !== undefined) {
    filter.isSlabType = isSlabType;
  }
  if (subCategory !== undefined) {
    filter["$subCategory.name$"] = subCategory;
  }
  const data: any = await productRepository.getAllProducts(page, limit, search, Object.keys(filter).length ? filter : undefined, true);

  // Map data accordingly product -> block -> slab
  let finalData = await Promise.all(
    data.products.map(async (product: any) => {
      // Fetch inventoryProducts for this product filtered by locationId
      const locationInventoryProducts: any = await inventoryProductRepository.getInventoryProducts(
        { productId: product.id.toString() },
        locationId
      );

      if (!locationInventoryProducts.length) {
        return undefined;
      }

      // Group inventoryProducts by block
      const blockGroups = new Map<string | null, any[]>();

      locationInventoryProducts.forEach((invProduct: any) => {
        const slab = invProduct.slab;
        if (!slab) return;

        const block = slab.block || null;
        if (!blockGroups.has(block)) {
          blockGroups.set(block, []);
        }

        const inventoryProductData = {
          ...invProduct.get({ plain: true }),
          slab: slab.get({ plain: true })
        };

        blockGroups.get(block)?.push(inventoryProductData);
      });

      // Create blocks array with totalQuantity calculations
      const blocks = Array.from(blockGroups.entries()).map(([block, inventoryProducts]: any) => {
        const totalQuantity = decimal.decimalSum(
          inventoryProducts.map((item: any) =>
            item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold && item.slab
              ? item.slab?.receivedSqrFt || 0
              : 0
          )
        );

        return {
          block,
          totalQuantity,
          inventoryProducts
        };
      });

      // Calculate totalAvailableQuantity
      let totalAvailableQuantity = 0;
      let totalAvailableQuantityUnit = 0;

      const availableItems = (locationInventoryProducts || []).filter((item: any) =>
        item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
      );

      if (product.isSlabType) {
        const available = availableItems.map((item: any) => item?.slab?.receivedSqrFt || 0);
        totalAvailableQuantity = decimal.decimalSum(available);
        totalAvailableQuantityUnit = availableItems.length;
      } else {
        totalAvailableQuantity = availableItems.length;
        totalAvailableQuantityUnit = availableItems.length;
      }

      const totalSlabsCount = locationInventoryProducts.length;

      const totalHoldQuantity = decimal.decimalSum(
        locationInventoryProducts.map((item: any) =>
          item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && item.hold && item.slab
            ? item.slab?.receivedSqrFt || 0
            : 0
        )
      );

      delete product.inventoryProducts;

      if (product.images && product.images.length > 0) {
        const primaryImg = product.images[0];
        if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
          primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
        }
        product.primaryImage = primaryImg;
      } else {
        product.primaryImage = null;
      }
      delete product.images;

      return {
        ...product,
        totalAvailableQuantity,
        totalAvailableQuantityUnit,
        totalSlabsCount,
        totalHoldQuantity,
        blocks
      };
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

export const fetchProductsWithSlabsByLocationGroupedByLot = async (
  page: number,
  limit: number,
  locationId: number,
  isSlabType?: boolean,
  search?: string,
  subCategory?: string
) => {
  const filter: any = {};
  if (isSlabType !== undefined) {
    filter.isSlabType = isSlabType;
  }
  if (subCategory !== undefined) {
    filter["$subCategory.name$"] = subCategory;
  }
  const data: any = await productRepository.getAllProducts(page, limit, search, Object.keys(filter).length ? filter : undefined, true);

  // Map data accordingly product -> lot (bundle) -> slab
  let finalData = await Promise.all(
    data.products.map(async (product: any) => {
      // Fetch inventoryProducts for this product filtered by locationId
      const locationInventoryProducts: any = await inventoryProductRepository.getInventoryProducts(
        { productId: product.id.toString() },
        locationId
      );

      if (!locationInventoryProducts.length) {
        return undefined;
      }

      // Group inventoryProducts by lot (bundle)
      const bundleGroups = new Map<string | null, any[]>();

      locationInventoryProducts.forEach((invProduct: any) => {
        const slab = invProduct.slab;
        if (!slab) return;

        const lot = slab.lot || null;
        if (!bundleGroups.has(lot)) {
          bundleGroups.set(lot, []);
        }

        const inventoryProductData = {
          ...invProduct.get({ plain: true }),
          slab: slab.get({ plain: true })
        };

        bundleGroups.get(lot)?.push(inventoryProductData);
      });

      // Create bundles array with totalQuantity calculations
      const bundles = Array.from(bundleGroups.entries()).map(([bundle, inventoryProducts]: any) => {
        const totalQuantity = decimal.decimalSum(
          inventoryProducts.map((item: any) =>
            item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold && item.slab
              ? item.slab?.receivedSqrFt || 0
              : 0
          )
        );

        return {
          bundle,
          totalQuantity,
          inventoryProducts
        };
      });

      // Calculate totalAvailableQuantity
      let totalAvailableQuantity = 0;
      let totalAvailableQuantityUnit = 0;

      const availableItems = (locationInventoryProducts || []).filter((item: any) =>
        item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
      );

      if (product.isSlabType) {
        const available = availableItems.map((item: any) => item?.slab?.receivedSqrFt || 0);
        totalAvailableQuantity = decimal.decimalSum(available);
        totalAvailableQuantityUnit = availableItems.length;
      } else {
        totalAvailableQuantity = availableItems.length;
        totalAvailableQuantityUnit = availableItems.length;
      }

      const totalSlabsCount = locationInventoryProducts.length;

      const totalHoldQuantity = decimal.decimalSum(
        locationInventoryProducts.map((item: any) =>
          item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && item.hold && item.slab
            ? item.slab?.receivedSqrFt || 0
            : 0
        )
      );

      delete product.inventoryProducts;

      if (product.images && product.images.length > 0) {
        const primaryImg = product.images[0];
        if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
          primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
        }
        product.primaryImage = primaryImg;
      } else {
        product.primaryImage = null;
      }
      delete product.images;

      return {
        ...product,
        totalAvailableQuantity,
        totalAvailableQuantityUnit,
        totalSlabsCount,
        totalHoldQuantity,
        bundles
      };
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

/**
 * Level 1 — Products only (no SIPLs/bundles/blocks/inventoryProducts).
 * Returns products with aggregate counts so the table renders fast.
 */
export const fetchProductsOnlyByLocation = async (page: number, limit: number, locationId: number, filter?: any, search?: string) => {
  const data: any = await productRepository.getAllProducts(page, limit, search, filter, true);

  const finalData = await Promise.all(
    data.products.map(async (product: any) => {
      let totalAvailableQuantity = 0;
      let totalAvailableQuantityUnit = 0;

      const availableItems = (product?.inventoryProducts || []).filter((item: any) =>
        item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
      );

      if (product.isSlabType) {
        const available = availableItems.map((item: any) => item?.slab?.receivedSqrFt || 0);
        totalAvailableQuantity = decimal.decimalSum(available);
        totalAvailableQuantityUnit = availableItems.length;
      } else {
        totalAvailableQuantity = availableItems.length;
        totalAvailableQuantityUnit = availableItems.length;
      }

      const holds = product?.inventoryProducts?.map((e: any) =>
        e.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && e.hold ? (e.isSlabType ? e.slab?.receivedSqrFt : 1) : 0
      );

      let totalHoldQuantity = 0;
      let totalHoldQuantityUnit = 0;

      if (holds) {
        totalHoldQuantity = decimal.decimalSum(holds);
        totalHoldQuantityUnit = holds.filter(Boolean).length;
      }

      if (product.images && product.images.length > 0) {
        const primaryImg = product.images[0];
        if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
          primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
        }
        product.primaryImage = primaryImg;
      } else {
        product.primaryImage = null;
      }
      delete product.images;
      delete product.inventoryProducts;

      return {
        ...product,
        totalAvailableQuantity,
        totalAvailableQuantityUnit,
        totalHoldQuantity,
        totalHoldQuantityUnit,
      };
    })
  );

  return { products: finalData, total: data.total };
};

export const fetchBlocksByProductAndLocation = async (req: AuthRequest, productId: number, locationId: number, excludeSoldCanceled = false) => {
  const blocks: any = await inventoryProductRepository.getDistinctGroupsByProduct(productId, locationId, 'block', excludeSoldCanceled, req.query);
  return blocks.map((b: any) => ({
    ...b,
    totalArea: Number(b.totalArea) || 0,
    inventoryProducts: [] // empty array to satisfy frontend shape and trigger lazy load
  }));
};

export const fetchBundlesByProductAndLocation = async (req: AuthRequest, productId: number, locationId: number, excludeSoldCanceled = false) => {
  const bundles: any = await inventoryProductRepository.getDistinctGroupsByProduct(productId, locationId, 'lot', excludeSoldCanceled, req.query);
  return bundles.map((b: any) => ({
    ...b,
    totalArea: Number(b.totalArea) || 0,
    inventoryProducts: [] // empty array to satisfy frontend shape and trigger lazy load
  }));
};

export const fetchSiplsByProductAndLocation = async (req: AuthRequest, productId: number, locationId: number, excludeSoldCanceled = false) => {
  const sipls = await siplRepository.getSIPLByProduct(req, productId, locationId, excludeSoldCanceled);
  if (!sipls.length) return [];

  const result = await Promise.all(
    sipls.map(async (sipl: any) => {
      const totalArea: any = await slabRepository.getTotalAreaBySIPL(sipl.id, excludeSoldCanceled);
      const plain = sipl.get({ plain: true });
      const unitCount = plain.inventoryProducts?.length || 0;

      const binNames = new Set<string>();
      const prices: number[] = [];

      (plain.inventoryProducts || []).forEach((inv: any) => {
        if (inv.bin?.name) {
          binNames.add(inv.bin.name);
        }
        const price = Number(inv.sellingPrice);
        if (!isNaN(price) && price > 0) {
          prices.push(price);
        }
      });

      const locations = Array.from(binNames).join(', ') || '--';
      const avgSellingPrice = prices.length > 0 ? decimal.decimalDivide(decimal.decimalSum(prices), prices.length) : 0;

      // inventoryProducts array intentionally empty — loaded lazily at level 3
      return {
        ...plain,
        totalArea: totalArea[0]?.totalArea,
        inventoryProducts: [],
        unitCount,
        locations,
        avgSellingPrice,
      };
    })
  );
  return result;
};

export const getInventoryStats = async (locationId: number) => {
  const sequelize = models.InventoryProduct.sequelize;
  if (!sequelize) {
    throw new Error("Sequelize instance not found");
  }

  // 1. Total Products (distinct count of productId)
  const totalProducts = await models.InventoryProduct.count({
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
    },
    distinct: true,
    col: "productId",
  });

  // 2. Total Slabs (count of items with isSlabType: true)
  const totalSlabs = await models.InventoryProduct.count({
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: true,
    },
  });

  // 3. Total Quantity Available (hold is null)
  // Slab items: sum of area
  const slabQuantityResult = await models.InventoryProduct.findAll({
    attributes: [
      [
        sequelize.fn(
          "SUM",
          sequelize.literal("`slab`.`receivingLength` * `slab`.`receivingWidth` / 144")
        ),
        "totalQuantity",
      ],
    ],
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: true,
      "$holdItems.id$": null,
    },
    include: [
      { association: "slab", required: true, attributes: [] },
      { association: "holdItems", required: false, attributes: [] },
    ],
    raw: true,
  });
  const slabQuantity = slabQuantityResult[0] ? (slabQuantityResult[0] as any).totalQuantity : 0;

  // Generic items: count
  const genericQuantity = await models.InventoryProduct.count({
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: false,
      "$holdItems.id$": null,
    },
    include: [
      { association: "holdItems", required: false, attributes: [] },
    ],
  });

  const totalQuantityAvailable = (Number(slabQuantity) || 0) + genericQuantity;

  // 4. Reserved (hold is not null)
  // Slab items: sum of area on hold
  const slabReservedResult = await models.InventoryProduct.findAll({
    attributes: [
      [
        sequelize.fn(
          "SUM",
          sequelize.literal("`slab`.`receivingLength` * `slab`.`receivingWidth` / 144")
        ),
        "totalReserved",
      ],
    ],
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: true,
    },
    include: [
      { association: "slab", required: true, attributes: [] },
      { association: "holdItems", required: true, attributes: [] },
    ],
    raw: true,
  });
  const slabReserved = slabReservedResult[0] ? (slabReservedResult[0] as any).totalReserved : 0;

  // Generic items: count on hold
  const genericReserved = await models.InventoryProduct.count({
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: false,
    },
    include: [
      { association: "holdItems", required: true, attributes: [] },
    ],
  });

  const totalReservedQuantity = (Number(slabReserved) || 0) + genericReserved;

  // 5. Total Value
  // Slab items: sum of cost * area
  const slabValueResult = await models.InventoryProduct.findAll({
    attributes: [
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(
            "COALESCE(`InventoryProduct`.`assetValue`, 0)"
          )
        ),
        "totalValue",
      ],
    ],
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: true,
    },
    include: [
      { association: "slab", required: true, attributes: [] },
    ],
    raw: true,
  });
  const slabValue = slabValueResult[0] ? (slabValueResult[0] as any).totalValue : 0;

  // Generic items: sum of cost
  const genericValueResult = await models.InventoryProduct.findAll({
    attributes: [
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(
            "COALESCE(`InventoryProduct`.`assetValue`, 0)"
          )
        ),
        "totalValue",
      ],
    ],
    where: {
      locationId,
      status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
      isSlabType: false,
    },
    raw: true,
  });
  const genericValue = genericValueResult[0] ? (genericValueResult[0] as any).totalValue : 0;

  const totalValue = (Number(slabValue) || 0) + (Number(genericValue) || 0);

  return {
    totalProducts,
    totalSlabs,
    totalQuantityAvailable: Number(totalQuantityAvailable.toFixed(2)),
    totalValue: Number(totalValue.toFixed(2)),
    totalReservedQuantity: Number(totalReservedQuantity.toFixed(2)),
  };
};

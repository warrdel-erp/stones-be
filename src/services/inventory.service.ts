import _ from "lodash";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as productRepository from "../repositories/product.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as decimal from '../helper/decimal'
import { AuthRequest } from "../middleware/authMiddleware";

export const fetchProductsWithSlabsByLocationGroupedBySipl = async (req: AuthRequest, page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, undefined, true);

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

      if (product.isSlabType) {
        const available = product?.inventoryProducts.map((item: any) => item.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold ? item?.slab?.receivedSqrFt : 0);
        totalAvailableQuantity = decimal.decimalSum(available);
        totalAvailableQuantityUnit = available.length;
      } else {
        totalAvailableQuantity = product?.inventoryProducts?.length;
        totalAvailableQuantityUnit = product?.inventoryProducts?.length;
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

      return { ...product, totalAvailableQuantity, totalAvailableQuantityUnit, totalSlabsCount, totalHoldQuantity, totalHoldQuantityUnit };
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

export const fetchProductsWithSlabsByLocationGroupedByBlock = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, undefined, true);

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
      if (product.isSlabType) {
        totalAvailableQuantity = decimal.decimalSum(
          locationInventoryProducts.map((item: any) =>
            item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold && item.slab
              ? item.slab?.receivedSqrFt || 0
              : 0
          )
        );
      } else {
        totalAvailableQuantity = locationInventoryProducts.filter(
          (item: any) => item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
        ).length;
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

      return {
        ...product,
        totalAvailableQuantity,
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

export const fetchProductsWithSlabsByLocationGroupedByLot = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, undefined, true);

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
      if (product.isSlabType) {
        totalAvailableQuantity = decimal.decimalSum(
          locationInventoryProducts.map((item: any) =>
            item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold && item.slab
              ? item.slab?.receivedSqrFt || 0
              : 0
          )
        );
      } else {
        totalAvailableQuantity = locationInventoryProducts.filter(
          (item: any) => item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.hold
        ).length;
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

      return {
        ...product,
        totalAvailableQuantity,
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



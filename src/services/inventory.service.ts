import _ from "lodash";
import { PRODUCT_KIND, INVENTORY_ITEM_STATUS, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import * as productRepository from "../repositories/product.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";

export const fetchProductsWithSlabsByLocationGroupedBySipl = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, true);

  // Map data accordingly product -> sipl -> slab
  let finalData = await Promise.all(
    data.products.map(async (product: any) => {
      product = product.get({ plain: true });

      product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
      product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
      product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom)?.name;

      product.sipls = await siplRepository.getSIPLByProduct(product.id, locationId);

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

      let totalQuantity = (_.sumBy(
        _.flatMap(product.sipls, 'slabs'),
        item => item.receivingWidth * item.receivingWidth
      ) / 144).toFixed(2);

      if (!product.isSlabType) {
        totalQuantity = _.flatMap(product.sipls, 'genericProducts').length?.toString();
      }

      const totalSlabsCount = _.flatMap(product.sipls, 'slabs').length;

      let totalHoldQuantity = (_.sumBy(
        _.flatMap(product.sipls, 'slabs').filter((e: any) => e.inventoryProduct?.isHold),
        (item: any) => item.receivingWidth * item.receivingWidth
      ) / 144).toFixed(2);

      if (!product.isSlabType) {
        totalHoldQuantity = _.flatMap(product.sipls, 'genericProducts')?.filter(e => e.isHold)?.length?.toString();
      }

      const totalHoldSlabsCount = _.flatMap(product.sipls, 'slabs')?.filter((e: any) => e.inventoryProduct?.isHold)?.length;

      delete product.slabs

      return { ...product, totalQuantity, totalSlabsCount, totalHoldQuantity, totalHoldSlabsCount };
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

export const fetchProductsWithSlabsByLocationGroupedByBlock = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, true);

  const finalData = data.products.map((product: any) => {
    product = product.get({ plain: true })
    const blockGroups = new Map<number, any>();

    product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
    product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
    product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom)?.name;

    for (const slab of product.slabs) {
      if (!blockGroups.has(slab.block)) {
        blockGroups.set(slab.block, []);
      }
      blockGroups.get(slab.block)?.push(slab);
    }

    // name changed lot => bundle
    const blocks = Array.from(blockGroups.entries()).map(([block, slabs]: any) => {

      const totalQuantity = (_.sumBy(slabs,
        (item: any) => (item.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.inventoryProduct?.isHold) ? item.receivingLength * item.receivingWidth : 0
      ) / 144).toFixed(2);

      return {
        block,
        totalQuantity,
        slabs
      }
    });

    const totalQuantity = (_.sumBy(product.slabs,
      (item: any) => item.receivingLength * item.receivingWidth
    ) / 144).toFixed(2);

    const totalSlabsCount = product.slabs.length;

    const totalHoldQuantity = (_.sumBy(product.slabs.filter((e: any) => e.inventoryProduct?.isHold),
      (item: any) => item.receivingWidth * item.receivingWidth
    ) / 144).toFixed(2);

    const totalHoldSlabsCount = product.slabs?.filter((e: any) => e.inventoryProduct?.isHold)?.length;

    delete product.slabs;

    return {
      ...product,
      totalQuantity,
      totalHoldQuantity,
      totalSlabsCount,
      totalHoldSlabsCount,
      blocks
    };
  });

  return { products: finalData, total: data.total };
};

export const fetchProductsWithSlabsByLocationGroupedByLot = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit, undefined, true);

  const finalData = data.products.map((product: any) => {
    product = product.get({ plain: true })
    product.kind = PRODUCT_KIND.find((e) => e.id == product.kind)?.value;
    product.origin = COUNTRIES.find((e) => e.id == product.origin)?.name;
    product.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == product.uom)?.name;

    const bundleGroups = new Map<number, any>();

    for (const slab of product.slabs) {
      if (!bundleGroups.has(slab.lot)) {
        bundleGroups.set(slab.lot, []);
      }
      bundleGroups.get(slab.lot)?.push(slab);
    }

    // name changed lot => bundle
    const bundles = Array.from(bundleGroups.entries()).map(([bundle, slabs]: any) => {

      const totalQuantity = (_.sumBy(slabs,
        (item: any) => (item.status == INVENTORY_ITEM_STATUS.IN_INVENTORY && !item.inventoryProduct?.isHold) ? item.receivingLength * item.receivingWidth : 0
      ) / 144).toFixed(2);

      return {
        bundle,
        totalQuantity,
        slabs
      }
    });

    const totalQuantity = (_.sumBy(product.slabs,
      (item: any) => item.receivingLength * item.receivingWidth
    ) / 144).toFixed(2);

    const totalSlabsCount = product.slabs.length;

    const totalHoldQuantity = (_.sumBy(product.slabs.filter((e: any) => e.inventoryProduct?.isHold),
      (item: any) => item.receivingWidth * item.receivingWidth
    ) / 144).toFixed(2);

    const totalHoldSlabsCount = product.slabs?.filter((e: any) => e.inventoryProduct?.isHold)?.length;

    delete product.slabs;

    return {
      ...product,
      totalQuantity,
      totalHoldQuantity,
      totalSlabsCount,
      totalHoldSlabsCount,
      bundles
    };

  });

  return { products: finalData, total: data.total };
};



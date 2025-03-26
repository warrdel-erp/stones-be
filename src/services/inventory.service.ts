import { PRODUCT_KIND, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import * as productRepository from "../repositories/product.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";

export const fetchProductsWithSlabsByLocation = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit);

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

      return product;
    })
  );

  // Remove undefined values
  finalData = finalData.filter((e) => e);

  return { products: finalData, total: data.total };
};

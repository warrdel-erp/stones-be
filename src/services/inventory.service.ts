import * as productRepository from "../repositories/product.repository";
import * as siplRepository from "../repositories/sipl.repository";

export const fetchProductsWithSlabsByLocation = async (page: number, limit: number, locationId: number) => {
  const data: any = await productRepository.getAllProducts(page, limit);

  let index = 0;

  const finalData = [];

  for (let product of data.products) {
    product = product.get({ plain: true });

    product.sipls = await siplRepository.getSIPLByProduct(product.id, locationId);

    finalData.push(product);

    index++;
  }

  // return await productRepository.getProductsWithSlabsByLocation(locationId);
  return data;
};

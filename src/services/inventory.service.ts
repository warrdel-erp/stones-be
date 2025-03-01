import * as productRepository from "../repositories/product.repository";

export const fetchProductsWithSlabsByLocation = async (locationId: number) => {
  return await productRepository.getProductsWithSlabsByLocation(locationId);
};

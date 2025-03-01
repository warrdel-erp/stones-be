import { PRODUCT_COLORS } from "../constants";
import * as productCategoryRepository from "../repositories/productCategory.repository";
import * as productSubCategoryRepository from "../repositories/productSubCategory.repository";

export const getGeneralData = async () => {
  const productCategories = await productCategoryRepository.getAllProductCategories();
  const productSubCategories = await productSubCategoryRepository.getAllProductSubCategories();

  return {
    productCategories,
    productSubCategories,
    productColors: PRODUCT_COLORS,
  };
};

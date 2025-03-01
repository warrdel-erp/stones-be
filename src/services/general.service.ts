import { PRODUCT_COLORS, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";
import * as productCategoryRepository from "../repositories/productCategory.repository";
import * as productSubCategoryRepository from "../repositories/productSubCategory.repository";

export const getGeneralData = async () => {
  const productCategories = await productCategoryRepository.getAllProductCategories();
  const productSubCategories = await productSubCategoryRepository.getAllProductSubCategories();

  return {
    productCategories,
    productSubCategories,
    productColors: PRODUCT_COLORS,
    countries: COUNTRIES,
    unitOfMeasurement: UNITS_OF_MEASUREMENT,
  };
};

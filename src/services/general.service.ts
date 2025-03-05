import {
  DELIVERY_TYPE,
  FINISH,
  GROUPS,
  LANGUAGES,
  PAYMENT_TERMS,
  PRODUCT_COLORS,
  PRODUCT_KIND,
  SHIPMENT_TERMS,
  THICKNESS,
  UNITS_OF_MEASUREMENT,
  VENDOR_SCOP,
} from "../constants";
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
    deliveryType: DELIVERY_TYPE,
    paymentTerms: PAYMENT_TERMS,
    shipmentTerms: SHIPMENT_TERMS,
    vendorScope: VENDOR_SCOP,
    languages: LANGUAGES,
    thickness: THICKNESS,
    finish: FINISH,
    group: GROUPS,
    kind: PRODUCT_KIND,
  };
};

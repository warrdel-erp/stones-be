import {
  DELIVERY_TYPE,
  LANGUAGES,
  PAYMENT_TERMS,
  PRODUCT_KIND,
  SALES_TAX,
  SCOP,
  SHIPMENT_TERMS,
  UNITS_OF_MEASUREMENT
} from "../constants";
import { COUNTRIES } from "../constants/countries";
import { PAYMENT_METHOD } from "../constants/tableTypes";

import * as productBaseColorRepository from "../repositories/productBaseColor.repository";
import * as productFinishRepository from "../repositories/productFinish.repository";
import * as productGroupRepository from "../repositories/productGroup.repository";
import * as productSubCategoryRepository from "../repositories/productSubCategory.repository";

export const getGeneralData = async (clientId: number) => {
  const productSubCategories = await productSubCategoryRepository.getAllProductSubCategories(clientId);
  const productGroup = await productGroupRepository.findAll(clientId);
  const productBaseColors = await productBaseColorRepository.findAll(clientId);
  const productFinish = await productFinishRepository.findAll(clientId);

  return {
    productSubCategories,
    productColors: productBaseColors,
    countries: COUNTRIES,
    unitOfMeasurement: UNITS_OF_MEASUREMENT,
    deliveryType: DELIVERY_TYPE,
    paymentTerms: PAYMENT_TERMS,
    shipmentTerms: SHIPMENT_TERMS,
    scope: SCOP,
    languages: LANGUAGES,
    finish: productFinish,
    group: productGroup,
    kind: PRODUCT_KIND,
    salesTax: SALES_TAX,
    paymentMethods: PAYMENT_METHOD
  };
};

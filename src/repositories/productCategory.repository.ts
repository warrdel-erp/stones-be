import * as models from "../models";

// Get all product categories.
export const getAllProductCategories = async () => {
  return await models.ProductCategory.findAll();
};

import * as models from "../models";

// Get all product categories.
export const getAllProductSubCategories = async () => {
  return await models.ProductSubCategory.findAll();
};

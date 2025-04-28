import * as models from "../models";

export const createProductSubCategory = async (payload: any) => {
  return await models.ProductSubCategory.create(payload);
};

export const getAllProductSubCategories = async (clientId: number) => {
  return await models.ProductSubCategory.findAll({
    include: [
      {
        model: models.ProductCategory,
        as: "category",
        where: { clientId },
        required: true,
      },
    ],
  });
};

export const getProductSubCategoryById = async (id: number, clientId: number) => {
  return await models.ProductSubCategory.findOne({
    where: { id },
    include: [
      {
        model: models.ProductCategory,
        as: "category",
        attributes: [],
        where: { clientId },
        required: true,
      },
    ],
  });
};

export const updateProductSubCategory = async (id: number, data: any) => {
  return await models.ProductSubCategory.update(data, { where: { id } });
};

// This function deletes a product subcategory by its ID and checks if it belongs to the specified client
export const deleteProductSubCategory = async (id: number, clientId: number) => {
  const subCategory = await models.ProductSubCategory.findOne({
    where: { id },
    include: [
      {
        model: models.ProductCategory,
        as: "category",
        attributes: [],
        where: { clientId },
        required: true,
      },
    ],
  });

  if (subCategory) {
    return await models.ProductSubCategory.destroy({ where: { id } });
  }

  return 0; // No rows deleted
};

import * as models from "../models";
import { col, fn, literal, Op } from "sequelize";
import Slab from "../models/slab";
import Product from "../models/product";
import ProductCategory from "../models/productCategory";
import _ from "lodash";

export const createProductCategory = async (payload: any) => {
  return await models.ProductCategory.create(payload);
};

export const getAllProductCategories = async (clientId: number) => {
  return await models.ProductCategory.findAll({ where: { clientId } });
};

export const getProductCategoryById = async (id: number, clientId: number) => {
  return await models.ProductCategory.findOne({ where: { id, clientId } });
};

export const updateProductCategory = async (id: number, data: any) => {
  return await models.ProductCategory.update(data, { where: { id } });
};

export const deleteProductCategory = async (id: number, clientId: number) => {
  return await models.ProductCategory.destroy({ where: { id, clientId } });
};

export const getTotalSlabMetricByCategory = async (clientId: number) => {
  // Step 1: Get all categories for this client
  const subCategories = await models.ProductSubCategory.findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: ProductCategory,
        as: "category",
        attributes: ["id", "name"],
        where: { clientId },
        required: true,
      },
    ],
    raw: true,
    nest: true,
  });

  const subCategoryIds = subCategories.map((subCat: any) => subCat.id);

  // Step 2: Get total slab area grouped by categoryId
  const slabMetrics: any[] = await Slab.findAll({
    attributes: [
      [col("product.subCategoryId"), "subCategoryId"],
      [fn("SUM", literal("receivingWidth * receivingLength")), "totalMetric"],
    ],
    include: [
      {
        model: Product,
        as: "product",
        attributes: [],
        where: {
          subCategoryId: { [Op.in]: subCategoryIds },
        },
      },
    ],
    group: ["product.subCategoryId"],
    raw: true,
  });

  // Step 3: Merge metrics into categories
  const metricsMap = new Map<number, number>();

  for (const row of slabMetrics) {
    metricsMap.set(Number(row.subCategoryId), Number(row.totalMetric));
  }

  const categories = _.uniqBy(subCategories.map((subcategory: any) => subcategory.category), 'id')

  subCategories.forEach((subCategory: any) => {
    const belongsToCategory = categories.findIndex((cat: any) => cat.id === subCategory.category.id);

    const subCategoryWithMetric = {
      ...subCategory,
      totalQuantity: metricsMap.get(subCategory.id) || 0,
    };

    delete subCategoryWithMetric.category;

    if (Array.isArray(categories[belongsToCategory]?.subCategories)) {
      categories[belongsToCategory].subCategories.push({ ...subCategoryWithMetric })
    } else {
      categories[belongsToCategory].subCategories = [subCategoryWithMetric];

    }

  });

  return categories;
};
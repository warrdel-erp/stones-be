import { Op } from "sequelize";
import * as models from "../models";
import { CustomUpdateOptions } from "../types/custom";

export const createProduct = async (productData: any) => {
  return await models.Product.create(productData);
};

// Get all products
export const getAllProducts = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;
  const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};

  const { rows: products, count: total } = await models.Product.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: models.ProductCategory,
        as: "category",
      },
      {
        model: models.ProductSubCategory,
        as: "subCategory",
      },
      {
        model: models.Slab,
        as: "slabs",
        required: true,
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  console.log(total);

  return { products, total, page, limit };
};

// get product by id
export const getProductByIdSimple = async (id: number) => {
  return (await models.Product.findByPk(id))?.get({ plain: true });
};

// get product details by id
export const getProductById = async (id: number) => {
  return await models.Product.findOne({
    where: { id },
    include: [
      { model: models.Slab, as: "slabs" },
      { model: models.ProductCategory, as: "category" },
      {
        model: models.ProductSubCategory,
        as: "subCategory",
      },
    ],
  });
};

// Update product by ID
export const updateProduct = async (id: number, updateData: any, userId: number) => {
  const [updatedRows] = await models.Product.update(updateData, {
    where: { id },
    individualHooks: true,
    userId: userId,
  } as CustomUpdateOptions);

  if (!updatedRows) return null;

  return await models.Product.findByPk(id);
};

// Get product with specific location.
export const getProductsWithSlabsByLocation = async (locationId: number) => {
  return await models.Product.findAll({
    include: [
      {
        model: models.Slab,
        include: [
          {
            model: models.Bin,
            attributes: [],
            include: [
              {
                model: models.Warehouse,
                include: [
                  {
                    model: models.Location,
                    where: { id: locationId }, // Filter by locationId
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
};

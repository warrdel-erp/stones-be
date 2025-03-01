import { Op } from "sequelize";
import * as models from "../models";

export const createProduct = async (productData: any) => {
  return await models.Product.create(productData);
};

// Get all products
export const getAllProducts = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;
  const whereClause = search ? { productName: { [Op.like]: `%${search}%` } } : {};
  const { rows: products, count: total } = await models.Product.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { products, total, page, limit };
};

// Update product by ID
export const updateProduct = async (id: number, updateData: any) => {
  const [updatedRows] = await models.Product.update(updateData, { where: { id } });
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

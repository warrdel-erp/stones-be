import { Op } from "sequelize";
import Product from "../models/product";

export const createProduct = async (productData: any) => {
  return await Product.create(productData);
};

// Get all products
export const getAllProducts = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;
  const whereClause = search ? { productName: { [Op.like]: `%${search}%` } } : {};
  const { rows: products, count: total } = await Product.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { products, total, page, limit };
};

// Update product by ID
export const updateProduct = async (id: number, updateData: Partial<typeof Product>) => {
  const [updatedRows] = await Product.update(updateData, { where: { id } });
  if (!updatedRows) return null;

  return await Product.findByPk(id);
};

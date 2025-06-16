import { col, fn, Op } from "sequelize";
import * as models from "../models";
import { CustomUpdateOptions } from "../types/custom";

export const createProduct = async (productData: any) => {
  return await models.Product.create(productData);
};

// Get all products
export const getAllProducts = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any,
  onlyWithSlabs?: boolean
) => {
  const offset = (page - 1) * limit;
  const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};

  const { rows: products, count: total } = await models.Product.findAndCountAll({
    where: { ...whereClause, ...filter },
    include: [
      {
        association: "category",
      },
      {
        association: "subCategory",
      },
      {
        association: "slabs",
        required: onlyWithSlabs,
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "bin",
                attributes: ['name'],
                include: [
                  {
                    association: "warehouse",
                    include: [
                      {
                        association: "location", attributes: ["location"]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            association: 'sipl',
            attributes: ['id', 'invoiceCode']
          }
        ]
      },
      {
        association: "group",
        attributes: ["id", "name"],
      },
      {
        association: "baseColor",
        attributes: ["id", "name"],
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

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
      {
        model: models.LedgerAccount,
        as: "inventoryLinkAccount",
      },
      {
        model: models.LedgerAccount,
        as: "incomeAccount",
      },
      {
        model: models.LedgerAccount,
        as: "costOfGoodsAccount",
      },
      {
        model: models.ProductBaseColor,
        as: "baseColor",
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

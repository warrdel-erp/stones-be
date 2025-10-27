import { col, fn, literal, Op, Sequelize } from "sequelize";
import * as models from "../models";
import { CustomUpdateOptions } from "../types/custom";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as slabRepository from '../repositories/slab.repository'
import * as genericProductRepository from './genericProduct.repository'
import * as inventoryProductRepository from './inventoryProduct.repository'

export const createProduct = async (productData: any) => {
  return await models.Product.create(productData);
};

// Get all products with minimal data (only subcategory and group)
export const getAllProductsMinimal = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any
) => {
  const offset = (page - 1) * limit;
  const whereClause: any = { ...filter };

  if (search) {
    whereClause.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await models.Product.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        association: "subCategory",
        attributes: ["id", "name", "isSlabType"]
      },
      {
        association: "group",
        attributes: ["id", "name"]
      }
    ],
    attributes: [
      "id",
      "name",
      "alternativeName",
      "isSlabType",
      "status",
      "singleUnitPrice",
      "bundlePrice",
      "createdAt"
    ],
    order: [["name", "ASC"]]
  });

  return {
    products: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
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

  // If onlyWithSlabs is true, we need to handle it differently
  if (onlyWithSlabs) {
    // First get product IDs that have either slabs or generic products
    const productsWithInventory = await models.Product.findAll({
      attributes: ['id'],
      include: [
        {
          association: 'inventoryProducts',
          attributes: [],
          required: true,
        }
      ],
      raw: true
    });

    const productIds = productsWithInventory.map((p: any) => p.id);

    // Now get the full product details with these IDs
    let { rows: products, count: total } = await models.Product.findAndCountAll({
      where: {
        ...whereClause,
        ...filter,
        id: { [Op.in]: productIds }
      },
      include: [
        {
          association: "subCategory",
        },
        {
          association: "inventoryProducts",
          include: [
            {
              association: "genericProduct",
            },
            {
              association: "slab",
            },
          ]
        },
        {
          association: "group",
          attributes: ["id", "name"],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["name", "ASC"]],
    });

    products = await Promise.all(products.map(async e => {
      const plainProduct: any = e.get({ plain: true });

      plainProduct.averageLandedCost = await inventoryProductRepository.getAverageLandedCost(plainProduct.id);
      plainProduct.lastLandedCost = await inventoryProductRepository.getLastLandedCost(plainProduct.id);

      return plainProduct
    }))

    return { products, total, page, limit };
  } else {

    // Original query for when onlyWithSlabs is false
    const { rows: products, count: total } = await models.Product.findAndCountAll({
      where: { ...whereClause, ...filter },
      include: [
        {
          association: "subCategory",
        },
        {
          association: "slabs",
          required: false,
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
          association: "genericProducts",
          required: false,
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
      order: [["name", "ASC"]],
    });

    return { products, total, page, limit };
  }
};

// Get all products
export const getAllProductsWithCompactData = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any,
  onlyWithSlabs?: boolean
) => {
  const offset = (page - 1) * limit;
  const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};

  // If onlyWithSlabs is true, we need to handle it differently
  if (onlyWithSlabs) {

    // Now get the full product details with these IDs
    let { rows: products, count: total }: any = await models.Product.findAndCountAll({
      where: {
        ...whereClause,
        ...filter,
      },
      include: [
        {
          association: "subCategory",
        },
        {
          association: "group",
          attributes: ["id", "name"],
        },
        {
          association: "baseColor",
          attributes: ["id", "name"],
        },
        {
          association: 'inventoryProducts',
          where: { status: INVENTORY_ITEM_STATUS.IN_INVENTORY },
          attributes: []
        }
      ],
      limit,
      offset,
      distinct: true,
      order: [["name", "ASC"]],
    });

    // products = await getCountDataForProducts(products)

    return { products, total, page, limit };
  } else {
    // Original query for when onlyWithSlabs is false
    let { rows: products, count: total }: any = await models.Product.findAndCountAll({
      where: { ...whereClause, ...filter },
      include: [
        {
          association: "subCategory",
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
      order: [["name", "ASC"]],
    });

    // products = await getCountDataForProducts(products)

    return { products, total, page, limit };
  }
};


const getCountDataForProducts = async (products: any[]) => {
  return await Promise.all(products.map(async (product: any) => {
    const plainProduct = product.get({ plain: true });
    let countData: object[] = [];
    if (plainProduct.isSlabType) {
      countData = await slabRepository.getAvailableSlabsData(plainProduct.id);

    } else {
      countData = await genericProductRepository.getAvailableGenericProductData(plainProduct.id);
    }

    plainProduct.countData = countData[0];

    return plainProduct
  }))

}

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

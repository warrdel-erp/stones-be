import { Op, Transaction } from "sequelize";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as models from "../models";
import * as slabRepository from '../repositories/slab.repository';
import { CustomUpdateOptions } from "../types/custom";
import { scoped } from "../utils/scoped";
import * as genericProductRepository from './genericProduct.repository';
import * as inventoryProductRepository from './inventoryProduct.repository';

export const createProduct = async (productData: any) => {
  return await scoped(models.Product).create(productData);
};

export const bulkCreateProducts = async (productsData: any[]) => {
  return await scoped(models.Product).bulkCreate(productsData);
};

// Bulk create products for bulk upload - uses models directly with explicit clientId in data (no scoped)
export const bulkCreateProductsForBulkUpload = async (productsData: any[], transaction?: Transaction) => {
  return models.Product.bulkCreate(productsData, { transaction, validate: true });
};

// Helper to parse multi-select filter parameters into Sequelize Op.in and appropriate conditions
const parseFilterWhereClause = (filter?: any) => {
  if (!filter) return {};
  const where: any = {};

  Object.keys(filter).forEach((key) => {
    const val = filter[key];
    if (val === undefined || val === null || val === '') return;

    if (key === 'isSlabType') {
      if (val === 'true' || val === true || val === 1 || val === '1') where[key] = true;
      else if (val === 'false' || val === false || val === 0 || val === '0') where[key] = false;
      return;
    }

    if (Array.isArray(val)) {
      const parsedArray = val
        .map((v: any) => (typeof v === 'string' ? v.trim() : v))
        .filter((v: any) => v !== '')
        .map((v: any) => (isNaN(Number(v)) ? v : Number(v)));
      if (parsedArray.length > 0) {
        where[key] = parsedArray.length === 1 ? parsedArray[0] : { [Op.in]: parsedArray };
      }
    } else if (typeof val === 'string' && val.includes(',')) {
      const parsedArray = val
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '')
        .map((item) => (isNaN(Number(item)) ? item : Number(item)));
      if (parsedArray.length > 0) {
        where[key] = { [Op.in]: parsedArray };
      }
    } else {
      const trimmed = typeof val === 'string' ? val.trim() : val;
      where[key] = isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
    }
  });

  return where;
};

// Get all products with minimal data (including subcategory, group, baseColor, finish)
export const getAllProductsMinimal = async (
  page: number,
  limit: number,
  search?: string,
  filter?: any
) => {
  const offset = (page - 1) * limit;
  const parsedWhere = parseFilterWhereClause(filter);
  const whereClause: any = { ...parsedWhere };

  if (search) {
    whereClause.name = { [Op.like]: `%${search}%` };
  }

  const productScoped = scoped(models.Product);
  const { count, rows } = await productScoped.findAndCountAll({
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
      },
      {
        association: "baseColor",
        attributes: ["id", "name"]
      },
      {
        association: "finish",
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
      "createdAt",
      "originId",
      "origin",
      "kindId",
      "kind",
      "baseColorId",
      "finishId",
      "groupId",
      "subCategoryId",
      "thickness"
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

  const productScoped = scoped(models.Product);

  // If onlyWithSlabs is true, we need to handle it differently
  if (onlyWithSlabs) {
    // First get product IDs that have either slabs or generic products
    const productsWithInventory = await productScoped.findAll({
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
    let { rows: products, count: total } = await productScoped.findAndCountAll({
      where: {
        ...whereClause,
        ...parseFilterWhereClause(filter),
        id: { [Op.in]: productIds }
      },
      include: [
        {
          association: "subCategory",
        },
        {
          association: "finish",
          attributes: ["id", "name"],
        },
        {
          association: "baseColor",
          attributes: ["id", "name"],
        },
        {
          association: "inventoryProducts",
          include: [
            {
              association: 'holdItem',
              attributes: ['id']
            },
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
        {
          association: "images",
          required: false,
          where: { isPrimary: true },
          include: [{ association: "s3File" }]
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["name", "ASC"]],
    });

    products = await Promise.all(products.map(async (e: any) => {
      const plainProduct: any = e.get({ plain: true });

      plainProduct.averageLandedCost = await inventoryProductRepository.getAverageLandedCost(plainProduct.id);
      plainProduct.lastLandedCost = await inventoryProductRepository.getLastLandedCost(plainProduct.id);

      return plainProduct
    }))

    return { products, total, page, limit };
  } else {

    // Original query for when onlyWithSlabs is false
    const { rows: products, count: total } = await productScoped.findAndCountAll({
      where: { ...whereClause, ...parseFilterWhereClause(filter) },
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
                          association: "location", attributes: ["locationName"]
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
                          association: "location", attributes: ["locationName"]
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
        {
          association: "images",
          required: false,
          where: { isPrimary: true },
          include: [{ association: "s3File" }]
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

  const productScoped = scoped(models.Product);

  // If onlyWithSlabs is true, we need to handle it differently
  if (onlyWithSlabs) {

    // Now get the full product details with these IDs
    let { rows: products, count: total }: any = await productScoped.findAndCountAll({
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
          attributes: ['id', 'status', 'isSlabType'],
          include: [
            {
              association: 'holdItem',
              attributes: ['id']
            },
            {
              association: 'slab',
              attributes: ['id', 'receivingLength', 'receivingWidth'],
            }
          ]
        },
        {
          association: "images",
          required: false,
          where: { isPrimary: true },
          include: [{ association: "s3File" }]
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
    let { rows: products, count: total }: any = await productScoped.findAndCountAll({
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
        {
          association: "images",
          required: false,
          where: { isPrimary: true },
          include: [{ association: "s3File" }]
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
  const productScoped = scoped(models.Product);
  return (await productScoped.findByPk(id))?.get({ plain: true });
};

// get product details by id
export const getProductById = async (id: number) => {
  const productScoped = scoped(models.Product);
  return await productScoped.findOne({
    where: { id },
    include: [
      { model: models.ProductGroup, as: "group" },
      { model: models.ProductFinish, as: "finish" },
      { association: "inventoryProducts" },
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
    // raw: true,
    // nest: true
  });
};

// Update product by ID
export const updateProduct = async (id: number, updateData: any, userId: number) => {
  const productScoped = scoped(models.Product);
  const [updatedRows] = await productScoped.update(updateData, {
    where: { id },
    individualHooks: true,
    userId: userId,
  } as CustomUpdateOptions);

  if (!updatedRows) return null;

  return await productScoped.findByPk(id);
};

// Get product with specific location.
export const getProductsWithSlabsByLocation = async (locationId: number) => {
  const productScoped = scoped(models.Product);
  return await productScoped.findAll({
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

// Get product options for dropdowns/selects
export const getProductOptions = async (clientId: number, status?: string) => {
  const productScoped = scoped(models.Product);
  return productScoped.findAll({
    attributes: [
      ["name", "label"],
      ["id", "value"],
      "isSlabType",
      "uom",
      "uomId",
    ],
    where: {
      ...(status ? { status } : {}),
    },
    include: [
      {
        model: models.User,
        attributes: [],
        where: { clientId },
        required: true,
      },
    ],
    order: [["name", "ASC"]],
  });
};

// get products in which inventoryProducts's binId is empty.
export const getProductsWithEmptyBinInventory = async (
  page: number,
  limit: number,
) => {
  const offset = (page - 1) * limit;

  const productScoped = scoped(models.Product);
  const { count, rows } = await productScoped.findAndCountAll({
    include: [
      {
        association: "inventoryProducts",
        where: {
          binId: null,
          status: INVENTORY_ITEM_STATUS.IN_INVENTORY
        },
        required: true,
        attributes: [], // Exclude nested inventory data
      },
      {
        association: "subCategory",
        attributes: ["id", "name", "isSlabType"]
      },
      {
        association: "group",
        attributes: ["id", "name"]
      }
    ],
    limit,
    offset,
    distinct: true,
    order: [["name", "ASC"]],
  });

  return {
    products: rows,
    total: count,
    page,
    limit,
  };
};

export const getProductImageCount = async (productId: number, transaction?: Transaction) => {
  return await models.ProductImage.count({
    where: { productId },
    transaction
  });
};

export const createProductImage = async (productId: number, s3FileId: number, isPrimary: boolean, transaction?: Transaction) => {
  return await models.ProductImage.create({
    productId,
    s3FileId,
    isPrimary
  }, { transaction });
};

export const findProductImageById = async (id: number, transaction?: Transaction) => {
  return await models.ProductImage.findByPk(id, { transaction });
};

export const getAnotherProductImage = async (productId: number, excludeImageId: number, transaction?: Transaction) => {
  return await models.ProductImage.findOne({
    where: {
      productId,
      id: { [Op.ne]: excludeImageId }
    },
    transaction
  });
};

export const deleteProductImage = async (id: number, transaction?: Transaction) => {
  return await models.ProductImage.destroy({
    where: { id },
    transaction
  });
};

export const clearProductPrimaryImages = async (productId: number, transaction?: Transaction) => {
  return await models.ProductImage.update(
    { isPrimary: false },
    { where: { productId }, transaction }
  );
};

export const setProductImagePrimary = async (id: number, transaction?: Transaction) => {
  return await models.ProductImage.update(
    { isPrimary: true },
    { where: { id }, transaction }
  );
};

export const getProductImagesByProductId = async (productId: number) => {
  return await models.ProductImage.findAll({
    where: { productId },
    include: [{ association: "s3File" }],
  });
};

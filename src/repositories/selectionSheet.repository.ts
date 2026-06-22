import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Create a new selection sheet with items
 */
export const createSelectionSheet = async (
  data: {
    createdById: number;
    customerId: number;
    clientId: number;
  },
  transaction?: Transaction
) => {
  return await scoped(models.SelectionSheet).create(data, { transaction });
};

/**
 * Create selection sheet items
 */
export const createSelectionSheetItems = async (
  items: Array<{
    selectionSheetId: number;
    inventoryProductId: number;
    clientId: number;
  }>,
  transaction?: Transaction
) => {
  return await scoped(models.SelectionSheetItem).bulkCreate(items, { transaction });
};

/**
 * Get selection sheet by ID with all details
 */
export const getSelectionSheetById = async (id: number) => {
  const productScoped = scoped(models.Product);
  const products = (await productScoped.findAll({
    attributes: ['id', 'name'],
    include: [
      {
        association: "inventoryProducts",
        required: true,
        include: [
          {
            association: 'selectionSheetItems',
            attributes: ['id', 'selectionSheetId'],
            required: true,
            where: {
              selectionSheetId: id
            },
          },
          {
            association: 'holdItem',
            attributes: ['id']
          },
          {
            association: "slab",
          },
          {
            association: 'genericProduct'
          }
        ]
      },
    ],
  }));

  const selectionSheet = (await models.SelectionSheet.findByPk(id, {
    include: [
      {
        association: "createdBy",
        attributes: {
          exclude: ['password']
        },
        include: [
          {
            association: "user",

          },
        ],
      },
      {
        association: "customer",
      },
    ],
  }))?.get({ plain: true });

  selectionSheet.products = products;

  return selectionSheet
};



/**
 * Get all selection sheets for a client filtered by account
 */
export const getAllSelectionSheets = async (
  clientId: number,
  accountId: number,
  page: number,
  limit: number,
  productId?: number,
  search?: string
) => {
  const offset = (page - 1) * limit;

  const whereClause: any = {
    clientId,
    createdById: accountId
  };

  if (search) {
    const isNumeric = !isNaN(Number(search));
    const searchConditions: any[] = [
      { "$customer.name$": { [Op.like]: `%${search}%` } }
    ];
    if (isNumeric) {
      searchConditions.push({ id: Number(search) });
    }
    whereClause[Op.or] = searchConditions;
  }

  const { rows: data, count: total } = await scoped(models.SelectionSheet).findAndCountAll({
    where: whereClause,
    include: [
      {
        association: "createdBy",
        attributes: ["id", "email"],
        include: [
          {
            association: "user",
            attributes: ["id", "username", "phone"],
          },
        ],
      },
      {
        association: "customer",
        attributes: ["id", "name", "primaryPhoneNumber"],
      },
      {
        association: "items",
        attributes: ["id", "inventoryProductId"],
        required: !!productId,
        include: [
          {
            association: "inventoryProduct",
            required: !!productId,
            where: productId ? { productId } : {},
            include: [
              {
                association: "slab",
              },
              {
                association: 'genericProduct'
              }
            ]
          },
        ],
      },
    ],
    limit,
    offset,
    distinct: true,
    subQuery: false,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

/**
 * Delete selection sheet by ID
 */
export const deleteSelectionSheet = async (
  id: number,
  transaction?: Transaction
) => {
  return await scoped(models.SelectionSheet).destroy({
    where: { id },
    transaction,
  });
};

/**
 * Check if selection sheet exists and belongs to client
 */
export const findSelectionSheetByIdAndClient = async (
  id: number,
  clientId: number
) => {
  return await scoped(models.SelectionSheet).findOne({
    where: { id, clientId },
  });
};

/**
 * Find selection sheet item by ID and client
 */
export const findSelectionSheetItemByIdAndClient = async (
  id: number,
  clientId: number
) => {
  return await scoped(models.SelectionSheetItem).findOne({
    where: { id, clientId },
  });
};

/**
 * Delete selection sheet item by ID
 */
export const deleteSelectionSheetItem = async (
  id: number,
  transaction?: Transaction
) => {
  return await scoped(models.SelectionSheetItem).destroy({
    where: { id },
    transaction,
  });
};


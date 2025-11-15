import { Transaction } from "sequelize";
import * as models from "../models";

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
  return await models.SelectionSheet.create(data, { transaction });
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
  return await models.SelectionSheetItem.bulkCreate(items, { transaction });
};

/**
 * Get selection sheet by ID with all details
 */
export const getSelectionSheetById = async (id: number) => {

  const products = (await models.Product.findAll({
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
            association: 'hold',
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
  limit: number
) => {
  const offset = (page - 1) * limit;

  const { rows: data, count: total } = await models.SelectionSheet.findAndCountAll({
    where: {
      clientId,
      createdById: accountId
    },
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
        include: [
          {
            association: "inventoryProduct",
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
  return await models.SelectionSheet.destroy({
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
  return await models.SelectionSheet.findOne({
    where: { id, clientId },
  });
};


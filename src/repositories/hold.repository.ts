import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Create a new hold with items
 */
export const createHold = async (
  data: {
    description?: string;
    fabricatorId?: number;
    createdById: number;
    customerId: number;
    clientId: number;
    locationId: number;
  },
  transaction?: Transaction
) => {
  return await scoped(models.Hold).create(data, { transaction });
};

/**
 * Create hold items
 */
export const createHoldItems = async (
  items: Array<{
    holdId: number;
    inventoryProductId: number;
    clientId: number;
  }>,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProductHold).bulkCreate(items, { transaction });
};

/**
 * Get hold by ID with all details
 */
export const getHoldById = async (id: number) => {
  const productScoped = scoped(models.Product);
  const products = (await productScoped.findAll({
    attributes: ['id', 'name'],
    include: [
      {
        association: "inventoryProducts",
        required: true,
        include: [
          {
            association: 'holdItem',
            attributes: ['id', 'holdId'],
            required: true,
            where: {
              holdId: id
            },
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

  const hold = (await models.Hold.findByPk(id, {
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
      {
        association: "fabricator",
      },
      {
        association: "salesOrder",
        attributes: ["id", "clientSoNumber"],
      },
    ],
  }))?.get({ plain: true });

  if (hold) {
    hold.products = products;
  }

  return hold;
};

/**
 * Get all holds for a client filtered by account
 */
export const getAllHolds = async (
  clientId: number,
  accountId: number,
  page: number,
  limit: number,
  productId?: number
) => {
  const offset = (page - 1) * limit;

  const { rows: data, count: total } = await scoped(models.Hold).findAndCountAll({
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
        association: "fabricator",
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
 * Delete hold by ID
 */
export const deleteHold = async (
  id: number,
  transaction?: Transaction
) => {
  return await scoped(models.Hold).destroy({
    where: { id },
    transaction,
  });
};

/**
 * Check if hold exists and belongs to client
 */
export const findHoldByIdAndClient = async (
  id: number,
  clientId: number
) => {
  return await scoped(models.Hold).findOne({
    where: { id, clientId },
  });
};

/**
 * Find hold item by ID and client
 */
export const findHoldItemByIdAndClient = async (
  id: number,
  clientId: number
) => {
  return await scoped(models.InventoryProductHold).findOne({
    where: { id, clientId },
  });
};

/**
 * Delete hold item by ID
 */
export const deleteHoldItem = async (
  id: number,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProductHold).destroy({
    where: { id },
    transaction,
  });
};

/**
 * Find hold item by inventory product ID
 */
export const findHoldByInventoryProductId = async (
  inventoryProductId: number,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProductHold).findOne({
    where: { inventoryProductId },
    transaction,
  });
};

/**
 * Update hold by ID
 */
export const updateHold = async (
  id: number,
  data: Partial<{
    description: string;
    fabricatorId: number;
    customerId: number;
    stage: string;
  }>,
  transaction?: Transaction
) => {
  return await scoped(models.Hold).update(data, {
    where: { id },
    transaction,
  });
};

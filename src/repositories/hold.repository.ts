import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { AppError } from "../helper/appError";

/**
 * Create a new hold with items
 */
export const createHold = async (
  data: {
    description?: string;
    fabricatorId: number;
    createdById: number;
    customerId?: number;
    clientId: number;
    locationId: number;
    opportunityId?: number;
    expiresAt?: Date;
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
            association: 'holdItems',
            attributes: ['id', 'holdId', 'unitPrice'],
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
          },
          {
            association: "bin",
            include: [
              {
                association: "warehouse",
                include: [
                  {
                    association: "location",
                  }
                ]
              }
            ]
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
        include: [
          {
            association: "billingAddress",
          },
          {
            association: "primarySalesPerson",
          },
        ],
      },
      {
        association: "fabricator",
        include: [
          {
            association: "billingAddress",
          },
        ],
      },
      {
        association: "salesOrder",
        attributes: ["id", "clientSoNumber", "taxId"],
        include: [
          {
            association: "salesOrderProducts",
            attributes: ["id", "inventoryProductId", "unitPrice", "taxApplied"],
          }
        ]
      },
      {
        association: "client",
        include: [
          {
            association: "company",
          },
        ],
      },
      {
        association: "expiryLogs",
        include: [
          {
            association: "createdBy",
            attributes: { exclude: ['password'] },
            include: [
              {
                association: "user",
                attributes: ["id", "username", "phone"],
              },
            ],
          },
        ],
      },
    ],
  }))?.get({ plain: true });

  if (hold) {
    hold.products = products;
    if (Array.isArray(hold.expiryLogs)) {
      hold.expiryLogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
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
      { "$customer.name$": { [Op.like]: `%${search}%` } },
      { "$fabricator.name$": { [Op.like]: `%${search}%` } }
    ];
    if (isNumeric) {
      searchConditions.push({ clientHoldNumber: Number(search) });
    }
    whereClause[Op.or] = searchConditions;
  }

  const { rows: data, count: total } = await scoped(models.Hold).findAndCountAll({
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
      {
        association: "expiryLogs",
        attributes: ["id"],
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
 * Get hold by opportunity ID
 */
export const getHoldByOpportunityId = async (
  opportunityId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.Hold).findOne({
    where: { opportunityId, clientId },
    include: [
      {
        association: "items",
      }
    ],
    transaction,
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
 * Update hold item by ID
 */
export const updateHoldItem = async (
  id: number,
  data: Partial<{
    unitPrice: number;
  }>,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProductHold).update(data, {
    where: { id },
    transaction,
  });
};

/**
 * Find active (unexpired) hold item by inventory product ID
 */
export const findHoldByInventoryProductId = async (
  inventoryProductId: number,
  transaction?: Transaction
) => {
  return await scoped(models.InventoryProductHold).findOne({
    where: { inventoryProductId },
    include: [
      {
        association: "hold",
        required: true,
        where: {
          [Op.or]: [
            { expiresAt: { [Op.gt]: new Date() } },
            { expiresAt: { [Op.is]: null } },
          ],
        },
      },
    ],
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

/**
 * Create a new hold expiry log entry
 */
export const createHoldExpiryLog = async (
  data: {
    holdId: number;
    oldExpiresAt: Date | null;
    newExpiresAt: Date;
    reason: string;
    createdById: number;
    clientId: number;
  },
  transaction?: Transaction
) => {
  return await scoped(models.HoldExpiryLog).create(data, { transaction });
};

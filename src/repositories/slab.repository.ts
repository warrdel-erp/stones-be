import Slab from "../models/slab.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { col, fn, literal, Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";
import { scoped } from "../utils/scoped";

// Finds all slabs by SIPL ID and updates their status.
export const updateSlabStatusBySipl = async (siplId: number, transaction: Transaction): Promise<number> => {
  const [updatedCount] = await scoped(Slab).update(
    { status: INVENTORY_ITEM_STATUS.IN_INVENTORY },
    { where: { siplId, status: INVENTORY_ITEM_STATUS.INITIATE }, individualHooks: true, transaction } // Only update slabs that are initiated
  );

  return updatedCount;
};

// Finds all slabs by SIPL ID and updates their status.
export const setUnitLandedCost = async (
  siplId: number,
  productId: number,
  landedUnitCost: number,
  transaction: Transaction
): Promise<number> => {
  const [updatedCount] = await scoped(Slab).update(
    { status: INVENTORY_ITEM_STATUS.IN_INVENTORY, landedUnitCost },
    { where: { siplId, productId }, individualHooks: true, transaction } // Only update slabs that are initiated
  );

  return updatedCount;
};

// Create slabs
export const createSlabs = async (slabData: any, transaction?: Transaction) => {
  return await scoped(models.Slab).bulkCreate(slabData, { transaction, individualHooks: true });
};

export const getLastSerialNumber = async (purchaseOrderId: number, siplId: number) => {
  const existingSlab: any = await scoped(Slab).findOne({
    where: { siplId: siplId, purchaseOrderId: purchaseOrderId },
    order: [["serialNumber", "DESC"]],
    attributes: ["serialNumber"],
  });

  return existingSlab ? existingSlab.serialNumber : 0;
};

export const getLastSlabNumber = async (productId: number, siplId: number) => {
  const existingSlab: any = await scoped(Slab).findOne({
    where: { siplId, productId },
    order: [["slabNumber", "DESC"]],
    attributes: ["slabNumber"],
  });

  return existingSlab ? existingSlab.slabNumber : 0;
};

/**
 * Check if a slab with the given productId, siplId, and slabNumber already exists
 */
export const checkSlabNumberExists = async (
  productId: number,
  siplId: number,
  slabNumber: number,
  transaction?: Transaction
) => {
  const existingSlab = await scoped(Slab).findOne({
    where: { productId, siplId, slabNumber },
    transaction,
    attributes: ["id"],
  });

  return !!existingSlab;
};

// Create slabs
export const getSlabByInventoryProductId = async (inventoryProductId: number, transaction?: Transaction) => {
  return await scoped(models.Slab).findOne({ where: { inventoryProductId }, transaction });
};

export const findBySiplProductId = async (siplProductId: number) => {
  const slabs = await scoped(models.Slab).findAll({
    where: { siplProductId },
    attributes: ["packageLength", "packageWidth"],
  });

  return slabs.map((slab: any) => slab.get({ plain: true }));
};

// Update the status of a Slab based on inventoryProductId.
export const updateSlabStatusByInventoryProduct = async (
  inventoryProductId: number,
  status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  transaction?: Transaction,
  additionalObj?: any
) => {
  // Find the related slab
  const slab = await scoped(Slab).findOne({
    where: { inventoryProductId },
    transaction,
  });

  if (!slab) {
    return null; // No slab found for this inventoryProductId
  }

  // Update the status
  await scoped(Slab).update({ status, ...additionalObj }, { where: { inventoryProductId }, individualHooks: true, transaction });

  return slab;
};

// Find by id
export const findByIdSimple = async (slabId: number) => {
  const slab = await models.Slab.findByPk(slabId);
  return slab?.get({ plain: true });
};

// Find by id
export const findByIdWithLogs = async (slabId: number) => {
  const slab = await models.Slab.findByPk(slabId, {
    include: [
      {
        association: 'inventoryProduct'
      },
      {
        model: models.SlabRemeasurement,
        as: "remeasurements",
      },
      {
        model: models.SIPL,
        as: "sipl",
        attributes: ["id"],
        include: [
          {
            model: models.PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["id"],
            include: [
              {
                model: models.Vendor,
                as: "supplier",
                attributes: ["name"],
              },
            ],
          },
        ],
      },
      {
        model: models.Product,
        as: "product",
        include: [
          {
            model: models.ProductSubCategory,
            as: "subCategory",
          },
        ],
      },
    ],
  });
  const slabPlain = slab?.get({ plain: true });

  return slabPlain;
};

/**
 * Fetch all slabs.
 */
export const getAllSlabs = async (filters?: WhereOptions, transaction?: Transaction, locationId?: number) => {
  return await scoped(Slab).findAll({
    where: filters,
    include: [
      {
        model: models.Product,
        as: 'product',
      },
      {
        model: models.SIPL,
        as: "sipl",
        attributes: ["id"],
        include: [
          {
            model: models.PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["id"],
          },
        ],
      },
      {
        association: "inventoryProduct",
        include: [
          {
            association: "bin",
            required: true,
            include: [
              {
                association: "warehouse",
                where: { ...(locationId ? { locationId } : {}) },
                required: true,
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
    transaction
  });
};

/**
 * Fetch all slabs that have a parent (i.e., result of a split).
 */
export const getSplitSlabs = async (transaction?: Transaction, locationId?: number) => {
  return await scoped(Slab).findAll({
    where: {
      parentSlabId: { [Op.ne]: null },
      isBroken: false
    },
    include: [
      {
        model: models.Product,
        as: 'product',
      },
      {
        model: models.SIPL,
        as: "sipl",
        attributes: ["id"],
        include: [
          {
            model: models.PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["id"],
          },
        ],
      },
      {
        association: "inventoryProduct",
        where: { ...(locationId ? { locationId } : {}) },
        required: true,
        include: [
          {
            association: "bin",
            required: false,
            include: [
              {
                association: "warehouse",
                required: false,
              }
            ]
          }
        ]
      },
    ],
    transaction
  });
};

export const getTotalAreaBySIPL = async (siplId: number, excludeSoldCanceled = false) => {
  const where: any = {
    siplId: siplId,
  };

  const include: any[] = [];
  if (excludeSoldCanceled) {
    include.push({
      association: 'inventoryProduct',
      required: true,
      where: {
        status: {
          [Op.notIn]: ['SOLD', 'CANCELED']
        }
      },
      attributes: []
    });
  }

  return await scoped(models.Slab).findAll({
    attributes: ["siplId", [sequelize.fn("SUM", sequelize.literal("receivingLength * receivingWidth")), "totalArea"]],
    where,
    include,
    group: ["siplId"],
    raw: true,
  });
};

export const getInStockSlabsData = async (productId: number) => {
  const data = await scoped(models.Slab).findAll({
    where: {
      productId,
    },
    include: [
      {
        association: "inventoryProduct",
        required: true,
        attributes: [],
        where: {
          status: {
            [Op.or]: [INVENTORY_ITEM_STATUS.IN_INVENTORY, INVENTORY_ITEM_STATUS.ALLOCATED],
          },
        }
      }
    ],
    attributes: [
      [fn("COUNT", fn("DISTINCT", col("slabs.id"))), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth / 144")), "area"],
    ],
    raw: true,
  });

  return data[0];
};

// Get data
export const getAllocatedSlabsData = async (productId: number) => {
  const data = await scoped(models.Slab).findAll({
    where: {
      productId,
    },
    include: [
      {
        association: "inventoryProduct",
        required: true,
        attributes: [],
        where: {
          status: INVENTORY_ITEM_STATUS.ALLOCATED,
        },
      },
    ],
    attributes: [
      [fn("COUNT", col("slabs.id")), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth / 144")), "area"],
    ],
    raw: true,
  });

  return data[0];
};

// Get data
export const getHoldSlabsData = async (productId: number) => {
  const data = await scoped(models.Slab).findAll({
    where: {
      productId,
    },
    include: [
      {
        association: "inventoryProduct",
        required: true,
        attributes: [],
        include: [
          {
            association: "hold",
            required: true,
            attributes: [],
          },
        ],
      },
    ],
    attributes: [
      [fn("COUNT", fn("DISTINCT", col("slabs.id"))), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth / 144")), "area"],
    ],
    raw: true,
  });

  return data[0];
};

// Get data
export const getAvailableSlabsData = async (productId: number) => {
  const data = await scoped(models.Slab).findAll({
    where: {
      productId,
      // Need to filter out instances where hold exists
      // We do this by ensuring the associated hold is null
      "$inventoryProduct.hold.id$": { [Op.is]: null },
    },
    include: [
      {
        association: "inventoryProduct",
        required: true,
        attributes: [],
        where: {
          status: INVENTORY_ITEM_STATUS.IN_INVENTORY,
        },
        include: [
          {
            association: "hold",
            required: false,
            attributes: [],
          },
        ],
      },
    ],
    attributes: [
      [fn("COUNT", fn("DISTINCT", col("slabs.id"))), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth / 144")), "area"],
    ],
    raw: true,
  });

  return data[0];
};

// update slab
export const updateSlabById = async (slabId: number, updateData: any, transaction?: Transaction) => {
  return await scoped(models.Slab).update(updateData, {
    where: { id: slabId },
    individualHooks: true,
    transaction,
  });
};

export const getOnlyBarcode = async (siplId: number) => {
  return await scoped(models.Slab).findAll({
    where: {
      siplId
    },
    attributes: ["id", "barcode"],
  });
};

/**
 * Get all slabs for a SIPL with their inventory products
 * Used to check if slabs are fully filled
 */
export const getSlabsWithInventoryProductBySiplId = async (siplId: number) => {
  return await scoped(models.Slab).findAll({
    where: { siplId },
    attributes: ['id', 'block', 'lot', 'receivingLength', 'receivingWidth', 'inventoryProductId'],
    include: [
      {
        association: 'inventoryProduct',
        attributes: ['id', 'binId'],
        required: true
      }
    ]
  });
};

/**
 * Get all parent slabs for a child slab by traversing up the parentSlabId chain
 * Returns array of parents from immediate parent to root parent
 */
export const getSlabSplitHistory = async (slabId: number) => {
  // Get the starting slab
  let currentSlab: any = await models.Slab.findByPk(slabId, {
    include: [
      {
        association: "inventoryProduct",
      },
      {
        association: "product",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!currentSlab) {
    return null;
  }

  const parents: any[] = [];
  const childSlab = currentSlab.get({ plain: true });

  // Traverse up the parent chain
  while (currentSlab.parentSlabId) {
    const parent: any = await models.Slab.findByPk(currentSlab.parentSlabId, {
      include: [
        {
          association: "inventoryProduct",
        },
        {
          association: "product",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!parent) {
      break;
    }

    const parentData = parent.get({ plain: true });
    parents.push(parentData);
    currentSlab = parent;
  }

  return {
    childSlab,
    parents, // Array from immediate parent to root parent
    totalParents: parents.length,
  };
};



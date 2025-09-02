import Slab from "../models/slab.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { col, fn, literal, Op, Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";

// Finds all slabs by SIPL ID and updates their status.
export const updateSlabStatusBySipl = async (siplId: number, transaction: Transaction): Promise<number> => {
  const [updatedCount] = await Slab.update(
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
  const [updatedCount] = await Slab.update(
    { status: INVENTORY_ITEM_STATUS.IN_INVENTORY, landedUnitCost },
    { where: { siplId, productId }, individualHooks: true, transaction } // Only update slabs that are initiated
  );

  return updatedCount;
};

// Create slabs
export const createSlabs = async (slabData: any, transaction?: Transaction) => {
  return await models.Slab.bulkCreate(slabData, { transaction, individualHooks: true });
};

export const getLastSerialNumber = async (purchaseOrderId: number, siplId: number) => {
  const existingSlab: any = await Slab.findOne({
    where: { siplId: siplId, purchaseOrderId: purchaseOrderId },
    order: [["serialNumber", "DESC"]],
    attributes: ["serialNumber"],
  });

  return existingSlab ? existingSlab.serialNumber : 0;
};

export const getLastSlabNumber = async (productId: number, siplId: number) => {
  const existingSlab: any = await Slab.findOne({
    where: { siplId, productId },
    order: [["slabNumber", "DESC"]],
    attributes: ["slabNumber"],
  });

  return existingSlab ? existingSlab.slabNumber : 0;
};

// Create slabs
export const getSlabByInventoryProductId = async (inventoryProductId: number, transaction?: Transaction) => {
  return await models.Slab.findOne({ where: { inventoryProductId }, transaction });
};

// update hold status of slab
export const updateSlabHoldStatus = async (slabId: number, isHold: boolean) => {
  return await Slab.update({ isHold }, { where: { id: slabId }, individualHooks: true });
};

// update hold status of slab
export const updateSlabCartStatus = async (slabId: number, isInCart: boolean) => {
  return await Slab.update({ isInCart }, { where: { id: slabId }, individualHooks: true });
};

// Update the status of a Slab based on inventoryProductId.
export const updateSlabStatusByInventoryProduct = async (
  inventoryProductId: number,
  status: (typeof INVENTORY_ITEM_STATUS)[keyof typeof INVENTORY_ITEM_STATUS],
  transaction?: Transaction,
  additionalObj?: any
) => {
  // Find the related slab
  const slab = await Slab.findOne({
    where: { inventoryProductId },
    transaction,
  });

  if (!slab) {
    return null; // No slab found for this inventoryProductId
  }

  // Update the status
  await Slab.update({ status, ...additionalObj }, { where: { inventoryProductId }, individualHooks: true, transaction });

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
  return slab?.get({ plain: true });
};

/**
 * Fetch all slabs.
 */
export const getAllSlabs = async (filters?: WhereOptions, transaction?: Transaction, locationId?: number) => {
  return await Slab.findAll({
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
      // {
      //   model: models.Bin,
      //   as: "bin",
      //   required: true,
      //   include: [
      //     {
      //       model: models.Warehouse,
      //       as: "warehouse",
      //       where: { ...(locationId ? { locationId } : {}) },
      //       required: true,
      //       include: [
      //         {
      //           model: models.Location,
      //           as: "location",
      //         }
      //       ]
      //     }
      //   ]
      // },
    ],
    transaction
  });
};

export const getTotalAreaBySIPL = async (siplId: number) => {
  return await models.Slab.findAll({
    attributes: ["siplId", [sequelize.fn("SUM", sequelize.literal("receivingLength * receivingWidth")), "totalArea"]],
    where: {
      siplId: siplId, // Filter slabs by the given SIPL IDs
    },
    group: ["siplId"],
    raw: true,
  });
};

export const getInStockSlabsData = async (productId: number) => {
  const data = await models.Slab.findAll({
    where: {
      productId,
      status: {
        [Op.or]: [INVENTORY_ITEM_STATUS.IN_INVENTORY, INVENTORY_ITEM_STATUS.ALLOCATED],
      },
    },
    attributes: [
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth")), "area"],
    ],
  });

  return data;
};

// Get data
export const getAllocatedHoldSlabsData = async (productId: number) => {
  const data = await models.Slab.findAll({
    where: {
      productId,
      [Op.or]: [{ status: INVENTORY_ITEM_STATUS.ALLOCATED }, { isHold: true }],
    },
    attributes: [
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth")), "area"],
    ],
  });

  return data;
};

// Get data
export const getAvailableSlabsData = async (productId: number) => {
  const data = await models.Slab.findAll({
    where: {
      productId,
      [Op.and]: [{ status: INVENTORY_ITEM_STATUS.IN_INVENTORY }, { isHold: false }],
    },
    attributes: [
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", literal("receivingLength * receivingWidth")), "area"],
    ],
  });

  return data;
};

// update slab
export const updateSlabById = async (slabId: number, updateData: any, transaction?: Transaction) => {
  return await models.Slab.update(updateData, {
    where: { id: slabId },
    individualHooks: true,
    transaction,
  });
};

export const getOnlyBarcode = async (siplId: number) => {
  return await models.Slab.findAll({
    where: {
      siplId
    },
    attributes: ["id", "barcode"],
  });
};

// get average landed cost.
export const getAverageLandedCost = async (productId: number) => {
  const data = await Slab.findOne({
    where: {
      productId
    },
    attributes: [
      [fn('AVG', col("landedUnitCost")), "avgLandedCost"]
    ]
  })
  return data?.dataValues
}

// get last landed cost.
export const getLastLandedCost = async (productId: number) => {
  return await models.Slab.findOne({
    where: {
      productId
    },
    attributes: ['landedUnitCost'],
    order: [['createdAt', 'desc']]
  })
}

export const getCartCount = async (clientId: number) => {
  return await Slab.count({
    where: {
      isInCart: true,
      clientId: clientId
    }
  });
};


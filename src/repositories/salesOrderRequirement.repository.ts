import { getAvailableInventoryProductsForProduct } from "./product.repository";
import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createRequirementLine = async (
  payload: {
    clientId: number;
    salesOrderId: number;
    productId: number;
    unitType: string;
    requiredCount: number;
    allocatedCount?: number;
    unitPrice: number;
    taxApplied?: boolean;
    status?: string;
    minLength?: number;
    minWidth?: number;
    locationId: number;
  },
  transaction?: Transaction
) => {
  return await scoped(models.SalesOrderRequirementLine).create({
    clientId: payload.clientId,
    salesOrderId: payload.salesOrderId,
    productId: payload.productId,
    unitType: payload.unitType,
    requiredCount: payload.requiredCount,
    allocatedCount: payload.allocatedCount || 0,
    unitPrice: payload.unitPrice,
    taxApplied: payload.taxApplied !== undefined ? payload.taxApplied : true,
    status: payload.status || "PENDING",
    minLength: payload.minLength,
    minWidth: payload.minWidth,
    locationId: payload.locationId,
  }, { transaction });
};

export const getRequirementLineById = async (
  id: number,
  salesOrderId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.SalesOrderRequirementLine).findOne({
    where: { id, salesOrderId, clientId },
    transaction,
  });
};

export const updateRequirementLine = async (
  id: number,
  clientId: number,
  data: { allocatedCount?: number; status?: string },
  transaction?: Transaction
) => {
  return await scoped(models.SalesOrderRequirementLine).update(data, {
    where: { id, clientId },
    transaction,
  });
};

export const getRequirementLinesAndAllocations = async (
  salesOrderId: number,
  clientId: number,
  transaction?: Transaction
) => {
  const requirementLines = await scoped(models.SalesOrderRequirementLine).findAll({
    where: { salesOrderId, clientId },
    include: [
      {
        model: models.Product,
        as: "product",
        include: [
          { model: models.ProductGroup, as: "group" },
          { model: models.ProductFinish, as: "finish" },
          {
            model: models.ProductImage,
            as: "images",
            include: [{ model: models.S3File, as: "s3File" }],
          },
        ],
      },
      {
        model: models.SalesOrderProduct,
        as: "allocatedProducts",
        include: [
          {
            model: models.InventoryProduct,
            as: "inventoryProduct",
            include: [
              { model: models.Slab, as: "slab" },
              { model: models.GenericProduct, as: "genericProduct" },
              { model: models.Product, as: "product" },
            ],
          },
          {
            model: models.PackagingList,
            as: "packagingList",
            attributes: ["id", "code", "stage"],
            required: false,
          },
        ],
      },
    ],
    transaction,
  });

  for (const req of requirementLines) {
    if (req.productId) {
      const availableInventory = await getAvailableInventoryProductsForProduct(
        req.productId,
        clientId,
        undefined, // limit
        undefined, // locationId
        req.minLength,
        req.minWidth,
        transaction
      );
      // We only want IN_INVENTORY
      const inInventoryCount = availableInventory.filter((inv: any) => inv.status === 'IN_INVENTORY').length;
      const initiateCount = availableInventory.filter((inv: any) => inv.status === 'INITIATE').length;
      req.setDataValue("availableCount", inInventoryCount);
      req.setDataValue("initiateCount", initiateCount);
    } else {
      req.setDataValue("availableCount", 0);
      req.setDataValue("initiateCount", 0);
    }
  }

  return requirementLines;
};

export const deleteRequirementLine = async (id: number, clientId: number, transaction?: Transaction) => {
  return await scoped(models.SalesOrderRequirementLine).destroy({
    where: { id, clientId },
    transaction,
  });
};

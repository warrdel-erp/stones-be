import { getAvailableInventoryProductsForProduct } from "./product.repository";
import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createOpportunity = async (payload: any, transaction?: Transaction) => {
  return await scoped(models.Opportunity).create(payload, { transaction });
};

export const getAllOpportunities = async (
  clientId: number,
  page: number = 1,
  limit: number = 20,
  search?: string,
  filter: any = {}
) => {
  const offset = (page - 1) * limit;
  const whereClause: any = { clientId };

  if (filter.status) {
    whereClause.status = filter.status;
  }

  if (search) {
    whereClause[Op.or] = [
      { opportunityName: { [Op.like]: `%${search}%` } },
      { contactPerson: { [Op.like]: `%${search}%` } },
      { projectName: { [Op.like]: `%${search}%` } },
      { endCustomerName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows: data, count: total } = await scoped(models.Opportunity).findAndCountAll({
    where: whereClause,
    distinct: true,
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name", "customerCode", "primaryPhoneNumber", "email"],
      },
      {
        model: models.Account,
        as: "createdBy",
        attributes: ["id", "email"],
      },
      {
        model: models.Account,
        as: "salesperson",
        attributes: ["id", "email"],
      },
      {
        model: models.Account,
        as: "assignedToUser",
        attributes: ["id", "email"],
      },
      {
        model: models.OpportunityRequirementProduct,
        as: 'requirementProducts',
        attributes: ['id', 'status', 'allocatedCount', 'requiredCount'],
        required: false,
      },
      {
        model: models.OpportunityQuotation,
        as: 'quotations',
        attributes: ['id', 'status', 'version'],
        include: [
          {
            model: models.SalesOrder,
            as: 'salesOrders',
            attributes: ['id'],
            required: false,
          },
        ],
        required: false,
      },
      {
        model: models.Hold,
        as: 'hold',
        attributes: ['id', 'clientHoldNumber', 'expiresAt', 'stage'],
        required: false,
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data,
    paginationData: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOpportunityById = async (id: number, clientId: number) => {
  return await scoped(models.Opportunity).findOne({
    where: { id, clientId },
    include: [
      {
        model: models.Customer,
        as: "customer",
      },
      {
        model: models.Account,
        as: "createdBy",
        attributes: ["id", "email"],
      },
      {
        model: models.Account,
        as: "salesperson",
        attributes: ["id", "email"],
      },
      {
        model: models.Account,
        as: "assignedToUser",
        attributes: ["id", "email"],
      },
      {
        model: models.Hold,
        as: "hold",
        include: [
          {
            association: "items",
            attributes: ["id", "inventoryProductId"],
          },
        ],
        required: false,
      },
    ],
  });
};

export const updateOpportunity = async (id: number, clientId: number, data: any, transaction?: Transaction) => {
  await scoped(models.Opportunity).update(data, {
    where: { id, clientId },
    transaction,
  });
  return await getOpportunityById(id, clientId);
};

export const deleteOpportunity = async (id: number, clientId: number, transaction?: Transaction) => {
  return await scoped(models.Opportunity).destroy({
    where: { id, clientId },
    transaction,
  });
};

// Requirement products & Allocations database CRUD operations

export const createRequirementProduct = async (
  payload: {
    clientId: number;
    opportunityId: number;
    productId: number;
    unitType: string;
    requiredCount: number;
    allocatedCount?: number;
    status?: string;
  },
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityRequirementProduct).create({
    clientId: payload.clientId,
    opportunityId: payload.opportunityId,
    productId: payload.productId,
    unitType: payload.unitType,
    requiredCount: payload.requiredCount,
    allocatedCount: payload.allocatedCount || 0,
    status: payload.status || "PENDING",
  }, { transaction });
};

export const getRequirementProductById = async (
  id: number,
  opportunityId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityRequirementProduct).findOne({
    where: { id, opportunityId, clientId },
    transaction,
  });
};

export const updateRequirementProduct = async (
  id: number,
  clientId: number,
  data: { allocatedCount?: number; status?: string },
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityRequirementProduct).update(data, {
    where: { id, clientId },
    transaction,
  });
};

export const createAllocations = async (allocations: any[], transaction?: Transaction) => {
  if (allocations.length === 0) return [];
  return await scoped(models.OpportunityInventoryProduct).bulkCreate(allocations, { transaction });
};

export const deleteAllocationsByRequirementId = async (
  requirementProductId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityInventoryProduct).destroy({
    where: { requirementProductId, clientId },
    transaction,
  });
};

export const getAllocationsByRequirementId = async (
  requirementProductId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityInventoryProduct).findAll({
    where: { requirementProductId, clientId },
    transaction,
  });
};

export const getRequirementLinesAndAllocations = async (
  opportunityId: number,
  clientId: number,
  transaction?: Transaction
) => {
  const requirementProducts = await scoped(models.OpportunityRequirementProduct).findAll({
    where: { opportunityId, clientId },
    include: [
      {
        model: models.Product,
        as: "product",
        include: [
          {
            model: models.ProductGroup,
            as: "group",
          },
          {
            model: models.ProductFinish,
            as: "finish",
          },
          {
            model: models.ProductImage,
            as: "images",
            include: [
              {
                model: models.S3File,
                as: "s3File",
              },
            ],
          },
        ],
      },
      {
        model: models.OpportunityInventoryProduct,
        as: "inventoryAllocations",
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
        ],
      },
    ],
    transaction,
  });

  for (const req of requirementProducts) {
    if (req.productId) {
      const availableInventory = await getAvailableInventoryProductsForProduct(
        req.productId,
        clientId
      );
      req.setDataValue("availableCount", availableInventory.length);
    } else {
      req.setDataValue("availableCount", 0);
    }
  }

  return requirementProducts;
};

export const deleteRequirementLine = async (requirementId: number, clientId: number, transaction?: Transaction) => {
  await deleteAllocationsByRequirementId(requirementId, clientId, transaction);
  return await scoped(models.OpportunityRequirementProduct).destroy({
    where: { id: requirementId, clientId },
    transaction,
  });
};

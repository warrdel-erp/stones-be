import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const getQuotationsByOpportunityId = async (
  opportunityId: number,
  clientId: number,
  transaction?: Transaction
) => {
  return await scoped(models.OpportunityQuotation).findAll({
    where: { opportunityId, clientId },
    transaction,
    include: [
      {
        model: models.SalesOrder,
        as: "salesOrders",
        attributes: ["id", "clientSoNumber"],
      },
      {
        model: models.Hold,
        as: "supersededByHold",
        attributes: ["id", "clientHoldNumber"],
      },
      {
        model: models.OpportunityQuotationInventoryProduct,
        as: "quotationInventoryProducts",
        include: [
          {
            model: models.InventoryProduct,
            as: "inventoryProduct",
            include: [
              {
                model: models.Product,
                as: "product",
                include: [
                  { model: models.ProductFinish, as: "finish" },
                  {
                    model: models.ProductImage,
                    as: "images",
                    include: [{ model: models.S3File, as: "s3File" }],
                  },
                ],
              },
              { model: models.Slab, as: "slab" },
              {
                model: models.InventoryProductImage,
                as: "images",
                include: [{ model: models.S3File, as: "s3File" }],
              },
              {
                model: models.InventoryProductHold,
                as: "holdItems",
                include: [{ model: models.Hold, as: "hold" }],
              },
              { association: "bin" },
            ],
          },
        ],
      },
    ],
    order: [["version", "DESC"]],
  });
};

export const getQuotationById = async (
  quotationId: number,
  clientId: number
) => {
  return await scoped(models.OpportunityQuotation).findOne({
    where: { id: quotationId, clientId },
    include: [
      {
        model: models.SalesOrder,
        as: "salesOrders",
        attributes: ["id", "clientSoNumber"],
      },
      {
        model: models.Hold,
        as: "supersededByHold",
        attributes: ["id", "clientHoldNumber"],
      },
      {
        model: models.OpportunityQuotationInventoryProduct,
        as: "quotationInventoryProducts",
        include: [
          {
            model: models.InventoryProduct,
            as: "inventoryProduct",
            include: [
              {
                model: models.Product,
                as: "product",
                include: [
                  { model: models.ProductFinish, as: "finish" },
                  {
                    model: models.ProductImage,
                    as: "images",
                    include: [{ model: models.S3File, as: "s3File" }],
                  },
                ],
              },
              { model: models.Slab, as: "slab" },
              {
                model: models.InventoryProductImage,
                as: "images",
                include: [{ model: models.S3File, as: "s3File" }],
              },
              {
                model: models.InventoryProductHold,
                as: "holdItems",
                include: [{ model: models.Hold, as: "hold" }],
              },
              { association: "bin" },
            ],
          },
        ],
      },
    ],
  });
};

export const createQuotation = async (
  quotationData: {
    clientId: number;
    opportunityId: number;
    quoteNumber: string;
    version: number;
    status: string;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    notes?: string;
  },
  inventoryItemsData: Array<{
    inventoryProductId: number;
    sellingRate: number;
    amount: number;
    priceSource?: string;
  }>,
  transaction?: Transaction
) => {
  const quotation = await scoped(models.OpportunityQuotation).create(
    quotationData,
    { transaction }
  );

  if (inventoryItemsData && inventoryItemsData.length > 0) {
    const itemsToCreate = inventoryItemsData.map((inv) => ({
      clientId: quotationData.clientId,
      quotationId: quotation.id,
      inventoryProductId: inv.inventoryProductId,
      sellingRate: inv.sellingRate,
      amount: inv.amount,
      priceSource: inv.priceSource || "Standard",
    }));

    await scoped(models.OpportunityQuotationInventoryProduct).bulkCreate(
      itemsToCreate,
      { transaction }
    );
  }

  return await getQuotationById(quotation.id, quotationData.clientId);
};

export const updateQuotation = async (
  quotationId: number,
  clientId: number,
  quotationData: {
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    notes?: string;
    status?: string;
  },
  inventoryItemsData: Array<{
    inventoryProductId: number;
    sellingRate: number;
    amount: number;
    priceSource?: string;
  }>,
  transaction?: Transaction
) => {
  await scoped(models.OpportunityQuotation).update(
    quotationData,
    { where: { id: quotationId, clientId }, transaction }
  );

  await scoped(models.OpportunityQuotationInventoryProduct).destroy({
    where: { quotationId, clientId },
    transaction,
  });

  if (inventoryItemsData && inventoryItemsData.length > 0) {
    const itemsToCreate = inventoryItemsData.map((inv) => ({
      clientId,
      quotationId,
      inventoryProductId: inv.inventoryProductId,
      sellingRate: inv.sellingRate,
      amount: inv.amount,
      priceSource: inv.priceSource || "Standard",
    }));

    await scoped(models.OpportunityQuotationInventoryProduct).bulkCreate(
      itemsToCreate,
      { transaction }
    );
  }

  return await getQuotationById(quotationId, clientId);
};

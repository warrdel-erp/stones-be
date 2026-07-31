import { Op, Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Find client by qrCode
 */
export const findClientByQrCode = async (qrCode: string) => {
  return await models.Client.findOne({
    where: { qrCode },
    attributes: ["id", "firstName", "lastName", "phone", "qrCode", "defaultLocationId"],
    include: [
      {
        association: "company",
        attributes: ["id", "companyName"],
      },
    ],
  });
};

/**
 * Find inventory products by qrCodes array
 */
export const findInventoryProductsByQrCodes = async (qrCodes: string[]) => {
  return await models.InventoryProduct.findAll({
    where: {
      qrCode: {
        [Op.in]: qrCodes,
      },
    },
    include: [
      {
        association: "product",
        include: [
          { association: "images" },
          { association: "group" },
          { association: "baseColor" },
          { association: "finish" },
        ],
      },
      { association: "slab" },
      { association: "genericProduct" },
      { association: "images" },
    ],
  });
};

/**
 * Find single inventory product by qrCode
 */
export const findInventoryProductByQrCode = async (qrCode: string) => {
  return await models.InventoryProduct.findOne({
    where: { qrCode },
    include: [
      {
        association: "product",
        include: [
          { association: "images" },
                  { association: "group" },
                  { association: "baseColor" },
                  { association: "finish" },
        ],
      },
      { association: "slab" },
      { association: "genericProduct" },
      { association: "location" },
      { association: "images" },
    ],
  });
};

/**
 * Create GuestSelection with items in a transaction
 */
export const createGuestSelection = async (
  selectionData: {
    clientId: number;
    guestName: string;
    guestMobile: string;
    guestEmail: string;
    choiceDescription?: string;
  },
  inventoryProductIds: number[],
  transaction?: Transaction
) => {
  const selection: any = await models.GuestSelection.create(selectionData, { transaction });

  if (inventoryProductIds.length > 0) {
    const items = inventoryProductIds.map((inventoryProductId) => ({
      guestSelectionId: selection.id,
      inventoryProductId,
    }));

    await models.GuestSelectionItem.bulkCreate(items, { transaction });
  }

  return selection;
};

/**
 * Fetch guest selections for a client with pagination & search
 */
export const getGuestSelectionsByClient = async (
  clientId: number,
  page: number,
  limit: number,
  search?: string
) => {
  const offset = (page - 1) * limit;

  const whereClause: any = { clientId };

  if (search) {
    whereClause[Op.or] = [
      { guestName: { [Op.like]: `%${search}%` } },
      { guestMobile: { [Op.like]: `%${search}%` } },
      { guestEmail: { [Op.like]: `%${search}%` } },
      { choiceDescription: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows: data, count: total } = await scoped(models.GuestSelection).findAndCountAll({
    where: whereClause,
    include: [
      {
        association: "items",
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "product",
                attributes: ["id", "name"],
                include: [
                  { association: "group" },
                  { association: "baseColor" },
                  { association: "finish" },
                ],
              },
              { association: "slab" },
              { association: "genericProduct" },
              { association: "images" },
            ],
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
 * Fetch single guest selection details by ID and clientId
 */
export const getGuestSelectionById = async (id: number, clientId: number) => {
  return await models.GuestSelection.findOne({
    where: { id, clientId },
    include: [
      {
        association: "items",
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "product",
                include: [
                  { association: "images" },
                  { association: "group" },
                  { association: "baseColor" },
                  { association: "finish" },
                ],
              },
              { association: "slab" },
              { association: "genericProduct" },
              { association: "location" },
              { association: "images" },
            ],
          },
        ],
      },
    ],
  });
};

/**
 * Delete guest selection by ID
 */
export const deleteGuestSelection = async (id: number, clientId: number, transaction?: Transaction) => {
  return await models.GuestSelection.destroy({
    where: { id, clientId },
    transaction,
  });
};

/**
 * Update guest selection status
 */
export const updateGuestSelectionStatus = async (
  id: number,
  clientId: number,
  status: "pending" | "reviewed" | "converted" | "cancelled"
) => {
  const [updatedCount] = await models.GuestSelection.update(
    { status },
    { where: { id, clientId } }
  );
  return updatedCount > 0;
};

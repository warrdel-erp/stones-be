import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as guestSelectionRepository from "../repositories/guestSelection.repository";
import { INVENTORY_ITEM_STATUS } from "../constants";

const extractActualQrCode = (rawQr: string): string => {
  if (!rawQr) return '';
  const trimmed = rawQr.trim();
  if (trimmed.includes('/')) {
    return trimmed.split('/')[1] || trimmed;
  }
  return trimmed;
};

export const getClientDetailsByQrCode = async (qrCode: string) => {
  const cleanQr = extractActualQrCode(qrCode);
  if (!cleanQr) {
    throw new AppError("Client QR code is required", 400);
  }

  const client = await guestSelectionRepository.findClientByQrCode(cleanQr);
  if (!client) {
    throw new AppError("Client not found for scanned QR code", 404);
  }

  return client;
};

export const getInventoryProductDetailsByQrCode = async (qrCode: string) => {
  const cleanQr = extractActualQrCode(qrCode);
  if (!cleanQr) {
    throw new AppError("Inventory Product QR code is required", 400);
  }

  const inventoryProduct: any = await guestSelectionRepository.findInventoryProductByQrCode(cleanQr);
  if (!inventoryProduct) {
    throw new AppError("Inventory Product not found for scanned QR code", 404);
  }

  if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
    throw new AppError(`Inventory product is not available (Current status: ${inventoryProduct.status || 'Unavailable'})`, 400);
  }

  return inventoryProduct;
};

export const submitGuestSelection = async (data: {
  clientQr: string;
  guestName: string;
  guestMobile: string;
  guestEmail: string;
  choiceDescription?: string;
  inventoryProductQrs: string[];
}) => {
  const { clientQr, guestName, guestMobile, guestEmail, choiceDescription, inventoryProductQrs } = data;

  if (!clientQr) {
    throw new AppError("Client QR code is required", 400);
  }
  if (!guestName || !guestMobile || !guestEmail) {
    throw new AppError("Guest Name, Mobile, and Email are required", 400);
  }
  if (!inventoryProductQrs || !Array.isArray(inventoryProductQrs) || inventoryProductQrs.length === 0) {
    throw new AppError("At least one inventory product must be selected", 400);
  }

  const client: any = await guestSelectionRepository.findClientByQrCode(clientQr);
  if (!client) {
    throw new AppError("Invalid Client QR code", 404);
  }

  const inventoryProducts: any[] = await guestSelectionRepository.findInventoryProductsByQrCodes(inventoryProductQrs);
  if (inventoryProducts.length === 0) {
    throw new AppError("No valid inventory products found for provided QR codes", 404);
  }

  const availableProducts = inventoryProducts.filter(
    (ip) => ip.status === INVENTORY_ITEM_STATUS.IN_INVENTORY
  );
  if (availableProducts.length === 0) {
    throw new AppError("None of the selected inventory products are currently available in inventory", 400);
  }

  const inventoryProductIds = availableProducts.map((ip) => ip.id);

  const transaction = await sequelize.transaction();
  try {
    const selection = await guestSelectionRepository.createGuestSelection(
      {
        clientId: client.id,
        guestName,
        guestMobile,
        guestEmail,
        choiceDescription,
      },
      inventoryProductIds,
      transaction
    );

    await transaction.commit();
    return selection;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getGuestSelections = async (
  clientId: number,
  page: number,
  limit: number,
  search?: string
) => {
  return await guestSelectionRepository.getGuestSelectionsByClient(clientId, page, limit, search);
};

export const getGuestSelectionById = async (id: number, clientId: number) => {
  const selection = await guestSelectionRepository.getGuestSelectionById(id, clientId);
  if (!selection) {
    throw new AppError("Guest Selection not found", 404);
  }
  return selection;
};

export const deleteGuestSelection = async (id: number, clientId: number) => {
  const deleted = await guestSelectionRepository.deleteGuestSelection(id, clientId);
  if (!deleted) {
    throw new AppError("Guest Selection not found or already deleted", 404);
  }
  return deleted;
};

export const updateGuestSelectionStatus = async (
  id: number,
  clientId: number,
  status: "pending" | "reviewed" | "converted" | "cancelled"
) => {
  const updated = await guestSelectionRepository.updateGuestSelectionStatus(id, clientId, status);
  if (!updated) {
    throw new AppError("Guest Selection not found or status unchanged", 404);
  }
  return updated;
};

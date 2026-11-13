import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as guestSelectionRepository from "../repositories/guestSelection.repository";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { generateSignedGetUrl } from "./s3File.service";

const extractActualQrCode = (rawQr: string): string => {
  if (!rawQr) return "";
  const trimmed = rawQr.trim();
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  }
  return trimmed;
};

const signImagesArray = async (images?: any[]) => {
  if (!Array.isArray(images) || images.length === 0) return;
  await Promise.all(
    images.map(async (img: any) => {
      if (img?.s3File?.s3Bucket && img?.s3File?.s3Key) {
        const signedUrl = await generateSignedGetUrl(img.s3File.s3Bucket, img.s3File.s3Key);
        img.s3File.url = signedUrl;
        img.imageUrl = signedUrl;
      } else if (img?.s3File?.url && !img.imageUrl) {
        img.imageUrl = img.s3File.url;
      }
    })
  );
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

  const inventoryProductModel: any = await guestSelectionRepository.findInventoryProductByQrCode(cleanQr);
  if (!inventoryProductModel) {
    throw new AppError("Inventory Product not found for scanned QR code", 404);
  }

  const inventoryProduct = inventoryProductModel.get
    ? inventoryProductModel.get({ plain: true })
    : inventoryProductModel;

  if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
    throw new AppError(
      `Inventory product is not available (Current status: ${inventoryProduct.status || "Unavailable"})`,
      400
    );
  }

  await signImagesArray(inventoryProduct.images);
  await signImagesArray(inventoryProduct.product?.images);

  return inventoryProduct;
};

export const getProductDetailsByQrId = async (rawProductId: string, clientQr?: string) => {
  const cleanIdStr = extractActualQrCode(rawProductId);
  const productId = Number(cleanIdStr);
  if (!cleanIdStr || isNaN(productId) || productId <= 0) {
    throw new AppError("Valid Product QR code is required", 400);
  }

  let clientId: number | undefined;
  if (clientQr) {
    const cleanClientQr = extractActualQrCode(clientQr);
    if (cleanClientQr) {
      const client: any = await guestSelectionRepository.findClientByQrCode(cleanClientQr);
      if (client) {
        clientId = client.id;
      }
    }
  }

  const productModel: any = await guestSelectionRepository.findProductByIdForGuest(productId, clientId);
  if (!productModel) {
    throw new AppError("Product not found for scanned QR code", 404);
  }

  const product = productModel.get ? productModel.get({ plain: true }) : productModel;
  await signImagesArray(product.images);

  return product;
};

export const submitGuestSelection = async (data: {
  clientQr: string;
  guestName: string;
  guestMobile: string;
  guestEmail: string;
  choiceDescription?: string;
  inventoryProductQrs?: string[];
  productRequests?: Array<{ productId: number; quantity: number }>;
}) => {
  const {
    clientQr,
    guestName,
    guestMobile,
    guestEmail,
    choiceDescription,
    inventoryProductQrs,
    productRequests,
  } = data;

  if (!clientQr) {
    throw new AppError("Client QR code is required", 400);
  }
  if (!guestName || !guestMobile || !guestEmail) {
    throw new AppError("Guest Name, Mobile, and Email are required", 400);
  }

  const hasInventoryQrs = Array.isArray(inventoryProductQrs) && inventoryProductQrs.length > 0;
  const hasProductRequests = Array.isArray(productRequests) && productRequests.length > 0;

  if (!hasInventoryQrs && !hasProductRequests) {
    throw new AppError("At least one inventory product or product request must be selected", 400);
  }

  const cleanClientQr = extractActualQrCode(clientQr);
  const client: any = await guestSelectionRepository.findClientByQrCode(cleanClientQr);
  if (!client) {
    throw new AppError("Invalid Client QR code", 404);
  }

  const itemsToCreate: guestSelectionRepository.GuestSelectionItemInput[] = [];

  if (hasInventoryQrs) {
    const cleanQrs = inventoryProductQrs!.map(extractActualQrCode).filter(Boolean);
    const inventoryProducts: any[] = await guestSelectionRepository.findInventoryProductsByQrCodes(cleanQrs);
    const availableProducts = inventoryProducts.filter(
      (ip) => ip.status === INVENTORY_ITEM_STATUS.IN_INVENTORY && ip.clientId === client.id
    );

    if (availableProducts.length === 0 && !hasProductRequests) {
      throw new AppError("None of the selected inventory products are currently available in inventory", 400);
    }

    availableProducts.forEach((ip) => {
      itemsToCreate.push({
        inventoryProductId: ip.id,
        productId: ip.productId ?? null,
        quantity: 1,
      });
    });
  }

  if (hasProductRequests) {
    const validRequests = productRequests!.filter(
      (req) => Number(req.productId) > 0 && Number(req.quantity) >= 1
    );

    if (validRequests.length === 0 && itemsToCreate.length === 0) {
      throw new AppError("Please provide a valid product and quantity (at least 1)", 400);
    }

    const requestedProductIds = Array.from(new Set(validRequests.map((r) => Number(r.productId))));
    const validProducts: any[] = await guestSelectionRepository.findProductsByIdsForGuest(
      requestedProductIds,
      client.id
    );
    const validProductIdSet = new Set(validProducts.map((p) => p.id));

    validRequests.forEach((req) => {
      const pid = Number(req.productId);
      const qty = Math.max(1, Math.floor(Number(req.quantity)));
      if (validProductIdSet.has(pid)) {
        itemsToCreate.push({
          inventoryProductId: null,
          productId: pid,
          quantity: qty,
        });
      }
    });
  }

  if (itemsToCreate.length === 0) {
    throw new AppError("No valid products or inventory items found to submit", 400);
  }

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
      itemsToCreate,
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
  const selectionModel: any = await guestSelectionRepository.getGuestSelectionById(id, clientId);
  if (!selectionModel) {
    throw new AppError("Guest Selection not found", 404);
  }

  const selection = selectionModel.get ? selectionModel.get({ plain: true }) : selectionModel;

  if (Array.isArray(selection.items)) {
    await Promise.all(
      selection.items.map(async (item: any) => {
        if (item.inventoryProduct) {
          await signImagesArray(item.inventoryProduct.images);
          await signImagesArray(item.inventoryProduct.product?.images);
        }
        if (item.product) {
          await signImagesArray(item.product.images);
        }
      })
    );
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

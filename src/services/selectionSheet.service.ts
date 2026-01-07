import * as selectionSheetRepository from "../repositories/selectionSheet.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as customerRepository from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";

/**
 * Create a new selection sheet with items
 */
export const createSelectionSheet = async (
    data: {
        customerId: number;
        inventoryProductIds: number[];
    },
    accountId: number,
    clientId: number
) => {
    const transaction = await sequelize.transaction();

    try {
        // Validate customer exists and belongs to client
        const customer = await customerRepository.getCustomerByIdSimple(data.customerId);

        if (!customer) {
            throw new AppError("Customer not found", 404);
        }

        if ((customer as any).clientId !== clientId) {
            throw new AppError("Customer does not belong to your client", 403);
        }

        // Validate all inventory products exist and belong to client
        if (!data.inventoryProductIds || data.inventoryProductIds.length === 0) {
            throw new AppError("At least one inventory product is required", 400);
        }

        for (const inventoryProductId of data.inventoryProductIds) {
            const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inventoryProductId);

            if (!inventoryProduct) {
                throw new AppError(`Inventory product with ID ${inventoryProductId} not found`, 404);
            }

            if (inventoryProduct.clientId !== clientId) {
                throw new AppError(`Inventory product with ID ${inventoryProductId} does not belong to your client`, 403);
            }

            if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
                throw new AppError(`Inventory product with ID ${inventoryProductId} is not in inventory`, 403);
            }

        }

        // Create selection sheet
        const selectionSheet: any = await selectionSheetRepository.createSelectionSheet(
            {
                createdById: accountId,
                customerId: data.customerId,
                clientId,
            },
            transaction
        );

        // Create selection sheet items
        const items = data.inventoryProductIds.map((inventoryProductId) => ({
            selectionSheetId: selectionSheet.id,
            inventoryProductId,
            clientId,
        }));

        await selectionSheetRepository.createSelectionSheetItems(items, transaction);

        await transaction.commit();

        // Fetch and return the complete selection sheet with items
        // const completeSelectionSheet = await selectionSheetRepository.getSelectionSheetById(selectionSheet.id);

        return selectionSheet;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get selection sheet by ID
 */
export const getSelectionSheetById = async (id: number, clientId: number) => {
    // Validate selection sheet exists and belongs to client
    const selectionSheet = await selectionSheetRepository.findSelectionSheetByIdAndClient(id, clientId);

    if (!selectionSheet) {
        throw new AppError("Selection sheet not found", 404);
    }

    // Get complete selection sheet with all details
    const completeSelectionSheet = await selectionSheetRepository.getSelectionSheetById(id);

    return completeSelectionSheet;
};

/**
 * Get all selection sheets for a client filtered by account
 */
export const getAllSelectionSheets = async (
    clientId: number,
    accountId: number,
    page: number = 1,
    limit: number = 10
) => {
    return await selectionSheetRepository.getAllSelectionSheets(clientId, accountId, page, limit);
};

/**
 * Delete selection sheet
 */
export const deleteSelectionSheet = async (id: number, clientId: number) => {
    // Validate selection sheet exists and belongs to client
    const selectionSheet = await selectionSheetRepository.findSelectionSheetByIdAndClient(id, clientId);

    if (!selectionSheet) {
        throw new AppError("Selection sheet not found", 404);
    }

    const deletedCount = await selectionSheetRepository.deleteSelectionSheet(id);

    if (deletedCount === 0) {
        throw new AppError("Failed to delete selection sheet", 500);
    }

    return { message: "Selection sheet deleted successfully" };
};

/**
 * Delete selection sheet item
 */
export const deleteSelectionSheetItem = async (id: number, clientId: number) => {
  // Validate selection sheet item exists and belongs to client
  const item = await selectionSheetRepository.findSelectionSheetItemByIdAndClient(id, clientId);

  if (!item) {
    throw new AppError("Selection sheet item not found", 404);
  }

  const deletedCount = await selectionSheetRepository.deleteSelectionSheetItem(id);

  if (deletedCount === 0) {
    throw new AppError("Failed to delete selection sheet item", 500);
  }

  return { message: "Selection sheet item deleted successfully" };
};


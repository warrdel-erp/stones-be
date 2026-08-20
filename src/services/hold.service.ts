import * as holdRepository from "../repositories/hold.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as customerRepository from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { CUSTOMER_TYPE, HOLD_STAGES } from "../constants/tableTypes";
import { isHoldClosed } from "../utils/hold.util";

/**
 * Create a new hold with items
 */
export const createHold = async (
    data: {
        fabricatorId: number;
        customerId?: number;
        description?: string;
        inventoryProductIds: number[];
        expiryDays?: number;
    },
    accountId: number,
    clientId: number,
    locationId: number
) => {
    const transaction = await sequelize.transaction();

    try {
        if (!data.fabricatorId) {
            throw new AppError("Fabricator is required", 400);
        }

        // Validate fabricator exists and belongs to client
        const fabricator: any = await customerRepository.getCustomerByIdSimple(data.fabricatorId);

        if (!fabricator) {
            throw new AppError("Fabricator not found", 404);
        }

        if (fabricator.clientId !== clientId) {
            throw new AppError("Fabricator does not belong to your client", 403);
        }

        // Validate customer if provided
        if (data.customerId) {
            const customer: any = await customerRepository.getCustomerByIdSimple(data.customerId);
            if (!customer) {
                throw new AppError("Customer not found", 404);
            }
            if (customer.clientId !== clientId) {
                throw new AppError("Customer does not belong to your client", 403);
            }
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

        // Compute expiry date (default 7 days)
        const days = data.expiryDays && [7, 15, 30].includes(Number(data.expiryDays)) ? Number(data.expiryDays) : 7;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Create hold
        const hold: any = await holdRepository.createHold(
            {
                description: data.description,
                fabricatorId: data.fabricatorId,
                createdById: accountId,
                customerId: data.customerId,
                clientId,
                locationId,
                expiresAt,
            },
            transaction
        );

        // Create hold items
        const items = data.inventoryProductIds.map((inventoryProductId) => ({
            holdId: hold.id,
            inventoryProductId,
            clientId,
        }));

        await holdRepository.createHoldItems(items, transaction);

        await transaction.commit();

        return hold;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get hold by ID
 */
export const getHoldById = async (id: number, clientId: number) => {
    // Validate hold exists and belongs to client
    const hold = await holdRepository.findHoldByIdAndClient(id, clientId);

    if (!hold) {
        throw new AppError("Hold not found", 404);
    }

    // Get complete hold with all details
    const completeHold = await holdRepository.getHoldById(id);

    return completeHold;
};

/**
 * Get all holds for a client filtered by account
 */
export const getAllHolds = async (
    clientId: number,
    accountId: number,
    page: number = 1,
    limit: number = 10,
    productId?: number,
    search?: string
) => {
    return await holdRepository.getAllHolds(clientId, accountId, page, limit, productId, search);
};

/**
 * Delete hold
 */
export const deleteHold = async (id: number, clientId: number) => {
    // Validate hold exists and belongs to client
    const hold = await holdRepository.findHoldByIdAndClient(id, clientId);

    if (!hold) {
        throw new AppError("Hold not found", 404);
    }

    if (isHoldClosed(hold)) {
        throw new AppError("Hold cannot be deleted because it is closed", 400);
    }

    const deletedCount = await holdRepository.deleteHold(id);

    if (deletedCount === 0) {
        throw new AppError("Failed to delete hold", 500);
    }

    return { message: "Hold deleted successfully" };
};

/**
 * Delete hold item
 */
export const deleteHoldItem = async (id: number, clientId: number) => {
  // Validate hold item exists and belongs to client
  const item = await holdRepository.findHoldItemByIdAndClient(id, clientId);

  if (!item) {
    throw new AppError("Hold item not found", 404);
  }

  // Fetch the hold to check its stage
  const hold = await holdRepository.findHoldByIdAndClient(item.holdId, clientId);
  if (isHoldClosed(hold)) {
    throw new AppError("Hold items cannot be deleted from a closed Hold", 400);
  }

  const deletedCount = await holdRepository.deleteHoldItem(id);

  if (deletedCount === 0) {
    throw new AppError("Failed to delete hold item", 500);
  }

  return { message: "Hold item deleted successfully" };
};

/**
 * Update hold item
 */
export const updateHoldItem = async (
  id: number,
  clientId: number,
  data: { unitPrice: number }
) => {
  // Validate hold item exists and belongs to client
  const item = await holdRepository.findHoldItemByIdAndClient(id, clientId);

  if (!item) {
    throw new AppError("Hold item not found", 404);
  }

  // Fetch the hold to check its stage
  const hold = await holdRepository.findHoldByIdAndClient(item.holdId, clientId);
  if (isHoldClosed(hold)) {
    throw new AppError("Hold items cannot be updated in a closed Hold", 400);
  }

  const [updatedCount] = await holdRepository.updateHoldItem(id, { unitPrice: data.unitPrice });

  if (updatedCount === 0) {
    throw new AppError("Failed to update hold item", 500);
  }

  return { message: "Hold item updated successfully" };
};

/**
 * Extend hold expiry by days with a mandatory reason and history logging
 */
export const extendHoldExpiry = async (
  id: number,
  data: { extendDays: number; reason: string },
  accountId: number,
  clientId: number
) => {
  if (!data.reason || !data.reason.trim()) {
    throw new AppError("Reason is required to extend hold expiry", 400);
  }

  const days = [7, 15, 30].includes(Number(data.extendDays)) ? Number(data.extendDays) : 7;

  const hold: any = await holdRepository.findHoldByIdAndClient(id, clientId);
  if (!hold) {
    throw new AppError("Hold not found", 404);
  }

  if (isHoldClosed(hold)) {
    throw new AppError("Cannot extend expiry for a closed hold", 400);
  }

  const transaction = await sequelize.transaction();
  try {
    const oldExpiresAt = hold.expiresAt ? new Date(hold.expiresAt) : new Date(hold.createdAt);
    const baseTime = Math.max(oldExpiresAt.getTime(), Date.now());
    const newExpiresAt = new Date(baseTime + days * 24 * 60 * 60 * 1000);

    // Create history log
    await holdRepository.createHoldExpiryLog(
      {
        holdId: id,
        oldExpiresAt: hold.expiresAt,
        newExpiresAt,
        reason: data.reason.trim(),
        createdById: accountId,
        clientId,
      },
      transaction
    );

    // Update current hold expiresAt
    await holdRepository.updateHold(id, { expiresAt: newExpiresAt } as any, transaction);

    await transaction.commit();
    return await holdRepository.getHoldById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

import * as holdRepository from "../repositories/hold.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as customerRepository from "../repositories/customer.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { CUSTOMER_TYPE, HOLD_STAGES } from "../constants/tableTypes";

/**
 * Create a new hold with items
 */
export const createHold = async (
    data: {
        customerId: number;
        description?: string;
        fabricatorId?: number;
        inventoryProductIds: number[];
    },
    accountId: number,
    clientId: number,
    locationId: number
) => {
    const transaction = await sequelize.transaction();

    try {
        // Validate customer exists and belongs to client
        const customer: any = await customerRepository.getCustomerByIdSimple(data.customerId);

        if (!customer) {
            throw new AppError("Customer not found", 404);
        }

        if (customer.clientId !== clientId) {
            throw new AppError("Customer does not belong to your client", 403);
        }

        if (customer.type === CUSTOMER_TYPE.CUSTOMER) {
            if (!data.description) {
                throw new AppError("Description is mandatory for customer type", 400);
            }
            if (data.fabricatorId) {
                const fabricator: any = await customerRepository.getCustomerByIdSimple(data.fabricatorId);
                if (!fabricator || fabricator.type !== CUSTOMER_TYPE.FABRICATOR) {
                    throw new AppError("Invalid fabricator selected", 400);
                }
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

        // Create hold
        const hold: any = await holdRepository.createHold(
            {
                description: data.description,
                fabricatorId: data.fabricatorId,
                createdById: accountId,
                customerId: data.customerId,
                clientId,
                locationId,
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
    productId?: number
) => {
    return await holdRepository.getAllHolds(clientId, accountId, page, limit, productId);
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

    if ((hold as any).stage === HOLD_STAGES.SO_CREATED) {
        throw new AppError("Hold cannot be deleted after a Sales Order has been created from it", 400);
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
  if (hold && (hold as any).stage === HOLD_STAGES.SO_CREATED) {
    throw new AppError("Hold items cannot be deleted after a Sales Order has been created from the Hold", 400);
  }

  const deletedCount = await holdRepository.deleteHoldItem(id);

  if (deletedCount === 0) {
    throw new AppError("Failed to delete hold item", 500);
  }

  return { message: "Hold item deleted successfully" };
};

import * as salesOrderRequirementRepository from "../repositories/salesOrderRequirement.repository";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { getAvailableInventoryProductsForProduct } from "../repositories/product.repository";
import * as slabRepository from "../repositories/slab.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { SALES_TAX, INVENTORY_ITEM_STATUS } from "../constants";
import { SALE_ORDER_PRODUCT_STAGES, SALES_ORDER_STATUS } from "../constants/tableTypes";

export const addRequirementLine = async (
  salesOrderId: number,
  clientId: number,
  payload: {
    productId: number;
    unitType: "slabs" | "sqft";
    requiredCount: number;
    unitPrice: number;
    taxApplied?: boolean;
    minLength?: number;
    minWidth?: number;
  },
  locationId?: number
) => {
  return await sequelize.transaction(async (transaction) => {
    const so: any = await salesOrderRepository.getSimpleSalesOrder(salesOrderId, transaction);
    if (!so) throw new AppError("Sales Order not found", 404);
    if (so.clientId !== clientId) throw new AppError("Unauthorized access to Sales Order", 403);
    if (so.status !== SALES_ORDER_STATUS.OPEN) {
      throw new AppError("Cannot add requirements to a closed Sales Order.", 400);
    }

    const locId = locationId || so.locationId;

    // 1. Find active available inventory products
    const availableInventoryAll = await getAvailableInventoryProductsForProduct(
      payload.productId,
      clientId,
      50,
      locId,
      payload.minLength,
      payload.minWidth,
      transaction
    );
    
    // Filter to IN_INVENTORY only
    const availableInventory = availableInventoryAll.filter((inv: any) => inv.status === INVENTORY_ITEM_STATUS.IN_INVENTORY);

    if (availableInventory.length === 0) {
      throw new AppError("No matching inventory found for the specified conditions.", 400);
    }

    // 2. Create requirement line
    const requirement: any = await salesOrderRequirementRepository.createRequirementLine(
      {
        clientId,
        salesOrderId,
        productId: payload.productId,
        unitType: payload.unitType,
        requiredCount: payload.requiredCount,
        allocatedCount: 0,
        unitPrice: payload.unitPrice,
        taxApplied: payload.taxApplied !== undefined ? payload.taxApplied : true,
        status: "PENDING",
        minLength: payload.minLength,
        minWidth: payload.minWidth,
        locationId: locId,
      },
      transaction
    );

    let allocatedCount = 0;
    const needed = Number(payload.requiredCount);

    const taxPercentage = (payload.taxApplied !== false && so.taxId) ? (SALES_TAX.find((e) => e.id == so.taxId)?.value || 0) : 0;

    for (const inv of availableInventory) {
      if (allocatedCount >= needed) break;

      const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(inv.id);
      
      let receivingAreaSqFt = null;
      if (inventoryProduct.isSlabType) {
        const slab: any = await slabRepository.getSlabByInventoryProductId(inv.id);
        if (slab) {
          receivingAreaSqFt = slab.receivedSqrFt;
        }
      }

      await salesOrderProductRepository.createSalesOrderProduct(
        {
          salesOrderId,
          inventoryProductId: inv.id,
          unitPrice: payload.unitPrice,
          taxApplied: payload.taxApplied !== undefined ? payload.taxApplied : true,
          taxPercentage,
          isSlabType: inventoryProduct.isSlabType,
          receivingAreaSqFt,
          stage: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER,
          requirementLineId: requirement.id,
          clientId,
          locationId: locId,
        },
        transaction
      );

      await inventoryProductRepository.updateInventoryProductStatusById(
        inv.id,
        INVENTORY_ITEM_STATUS.ALLOCATED,
        transaction
      );

      allocatedCount += 1;
    }

    // 4. Calculate requirement status
    let status = "PENDING";
    if (allocatedCount >= needed && needed > 0) {
      status = "COMPLETE";
    } else if (allocatedCount > 0) {
      status = "PARTIAL";
    }

    // 5. Update requirement line status & count
    await salesOrderRequirementRepository.updateRequirementLine(
      requirement.id,
      clientId,
      {
        allocatedCount,
        status,
      },
      transaction
    );

    return await salesOrderRequirementRepository.getRequirementLinesAndAllocations(
      salesOrderId,
      clientId,
      transaction
    );
  });
};

export const getRequirementLinesAndAllocations = async (salesOrderId: number, clientId: number) => {
  return await salesOrderRequirementRepository.getRequirementLinesAndAllocations(salesOrderId, clientId);
};

export const updateRequirementAllocations = async (
  salesOrderId: number,
  requirementId: number,
  clientId: number,
  inventoryProductIds: number[]
) => {
  return await sequelize.transaction(async (transaction) => {
    const so: any = await salesOrderRepository.getSimpleSalesOrder(salesOrderId, transaction);
    if (!so) throw new AppError("Sales Order not found", 404);
    if (so.clientId !== clientId) throw new AppError("Unauthorized access to Sales Order", 403);
    if (so.status !== SALES_ORDER_STATUS.OPEN) {
      throw new AppError("Cannot update allocations of a closed Sales Order.", 400);
    }

    const requirement: any = await salesOrderRequirementRepository.getRequirementLineById(
      requirementId,
      salesOrderId,
      clientId,
      transaction
    );

    if (!requirement) {
      throw new AppError("Requirement line not found", 404);
    }

    const requestedIds = Array.isArray(inventoryProductIds) ? inventoryProductIds.map(Number) : [];

    // Get all current allocations
    const allCurrentProducts = await scoped(models.SalesOrderProduct).findAll({
      where: {
        salesOrderId,
        requirementLineId: requirementId,
        clientId,
      },
      transaction
    });

    const currentIds = allCurrentProducts.map((p: any) => p.inventoryProductId);

    const idsToRemove = currentIds.filter((id: number) => !requestedIds.includes(id));
    const idsToAdd = requestedIds.filter((id: number) => !currentIds.includes(id));

    // Validate if any product to remove has progressed to packaging list or other stage
    for (const p of allCurrentProducts) {
      if (idsToRemove.includes((p as any).inventoryProductId)) {
        if ((p as any).packagingListId || (p as any).stage !== SALE_ORDER_PRODUCT_STAGES.SALES_ORDER) {
          throw new AppError(
            `Cannot remove slab #${(p as any).inventoryProductId}. It has already been added to a Packaging List.`,
            400
          );
        }
      }
    }

    // Remove unselected
    for (const p of allCurrentProducts) {
      if (idsToRemove.includes((p as any).inventoryProductId)) {
        await inventoryProductRepository.updateInventoryProductStatusById(
          (p as any).inventoryProductId,
          INVENTORY_ITEM_STATUS.IN_INVENTORY,
          transaction
        );
        await salesOrderProductRepository.deleteSalesOrderProduct((p as any).id, transaction);
      }
    }

    // Add new selected
    if (idsToAdd.length > 0) {
      const availableInventoryAll = await getAvailableInventoryProductsForProduct(
        requirement.productId,
        clientId,
        undefined,
        undefined,
        requirement.minLength,
        requirement.minWidth,
        transaction
      );
      
      const availableInventory = availableInventoryAll.filter((inv: any) => inv.status === INVENTORY_ITEM_STATUS.IN_INVENTORY);
      const availableSet = new Set(availableInventory.map((item: any) => item.id));

      const invalidIds = idsToAdd.filter((id: number) => !availableSet.has(id));
      if (invalidIds.length > 0) {
        throw new AppError(
          `Selected inventory item(s) #${invalidIds.join(", #")} are no longer available for allocation`,
          400
        );
      }

      const taxPercentage = (requirement.taxApplied !== false && so.taxId) ? (SALES_TAX.find((e) => e.id == so.taxId)?.value || 0) : 0;

      for (const invId of idsToAdd) {
        const inventoryProduct: any = await inventoryProductRepository.findInventoryProductById(invId);
        let receivingAreaSqFt = null;
        if (inventoryProduct.isSlabType) {
          const slab: any = await slabRepository.getSlabByInventoryProductId(invId);
          if (slab) {
            receivingAreaSqFt = slab.receivedSqrFt;
          }
        }

        await salesOrderProductRepository.createSalesOrderProduct(
          {
            salesOrderId,
            inventoryProductId: invId,
            unitPrice: requirement.unitPrice,
            taxApplied: requirement.taxApplied,
            taxPercentage,
            isSlabType: inventoryProduct.isSlabType,
            receivingAreaSqFt,
            stage: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER,
            requirementLineId: requirementId,
            clientId,
            locationId: requirement.locationId || so.locationId,
          },
          transaction
        );

        await inventoryProductRepository.updateInventoryProductStatusById(
          invId,
          INVENTORY_ITEM_STATUS.ALLOCATED,
          transaction
        );
      }
    }

    // Update requirement count and status
    const newAllocatedCount = requestedIds.length;
    const needed = Number(requirement.requiredCount || 0);

    let status = "PENDING";
    if (newAllocatedCount >= needed && needed > 0) {
      status = "COMPLETE";
    } else if (newAllocatedCount > 0) {
      status = "PARTIAL";
    }

    await salesOrderRequirementRepository.updateRequirementLine(
      requirementId,
      clientId,
      {
        allocatedCount: newAllocatedCount,
        status,
      },
      transaction
    );

    return await salesOrderRequirementRepository.getRequirementLinesAndAllocations(
      salesOrderId,
      clientId,
      transaction
    );
  });
};

export const removeRequirementLine = async (salesOrderId: number, requirementId: number, clientId: number) => {
  return await sequelize.transaction(async (transaction) => {
    const so: any = await salesOrderRepository.getSimpleSalesOrder(salesOrderId, transaction);
    if (!so) throw new AppError("Sales Order not found", 404);
    if (so.clientId !== clientId) throw new AppError("Unauthorized access to Sales Order", 403);
    if (so.status !== SALES_ORDER_STATUS.OPEN) {
      throw new AppError("Cannot remove requirement from a closed Sales Order.", 400);
    }

    const requirement = await salesOrderRequirementRepository.getRequirementLineById(
      requirementId,
      salesOrderId,
      clientId,
      transaction
    );

    if (!requirement) {
      throw new AppError("Requirement line not found", 404);
    }

    const currentProducts = await scoped(models.SalesOrderProduct).findAll({
      where: {
        salesOrderId,
        requirementLineId: requirementId,
        clientId,
      },
      transaction
    });

    for (const p of currentProducts) {
      if ((p as any).packagingListId || (p as any).stage !== SALE_ORDER_PRODUCT_STAGES.SALES_ORDER) {
        throw new AppError(`Cannot delete requirement line. Slabs have already been added to a Packaging List.`, 400);
      }
      
      await inventoryProductRepository.updateInventoryProductStatusById(
        (p as any).inventoryProductId,
        INVENTORY_ITEM_STATUS.IN_INVENTORY,
        transaction
      );
      await salesOrderProductRepository.deleteSalesOrderProduct((p as any).id, transaction);
    }

    await salesOrderRequirementRepository.deleteRequirementLine(requirementId, clientId, transaction);
    
    return await salesOrderRequirementRepository.getRequirementLinesAndAllocations(
      salesOrderId,
      clientId,
      transaction
    );
  });
};

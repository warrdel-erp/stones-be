import * as opportunityRepository from "../repositories/opportunity.repository";
import * as holdRepository from "../repositories/hold.repository";
import { getAvailableInventoryProductsForProduct } from "../repositories/product.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { SALES_TAX } from "../constants";
import moment from "moment";

interface NextAction {
  type: 'follow_up' | 'procure' | 'allocate' | 'create_quote' | 'create_so' | 'completed' | 'create_requirement';
  label: string;
  dueLabel?: string;
  urgency: 'normal' | 'warning' | 'critical';
  followUpAction?: string;
}

const computeNextAction = (opp: any): NextAction | null => {
  const reqs = opp.requirementProducts || [];
  const quotes = opp.quotations || [];

  // 1. Sales Order already created
  if (opp.status === 'SALES_ORDER' || quotes.some((q: any) => q.salesOrders && q.salesOrders.length > 0)) {
    return { type: 'completed', label: 'Sales Order Created', urgency: 'normal' };
  }

  // Skip lost / closed opportunities — status badge already covers this
  if (opp.status === 'LOST') return null;

  // 2. Published quotation exists — Follow up
  if (quotes.some((q: any) => q.status === 'PUBLISHED')) {
    return { type: 'follow_up', label: 'Follow up', urgency: 'normal' };
  }

  // 3. No requirements yet
  if (reqs.length === 0) {
    return { type: 'create_requirement', label: 'Create requirement', urgency: 'normal' };
  }

  // 4. Find / procure slabs (when any requirement line has 0 allocated / PENDING status)
  if (reqs.some((r: any) => r.status === 'PENDING')) {
    return { type: 'procure', label: 'Find / procure slabs', urgency: 'warning' };
  }

  // 4. Allocate more inventory (when any requirement line is PARTIAL)
  if (reqs.some((r: any) => r.status === 'PARTIAL')) {
    return { type: 'allocate', label: 'Allocate more inventory', urgency: 'warning' };
  }

  // 5. All requirements fulfilled, no published quotation yet -> Create quote
  if (reqs.length > 0 && reqs.every((r: any) => r.status === 'COMPLETE') && !quotes.some((q: any) => q.status === 'PUBLISHED')) {
    return { type: 'create_quote', label: 'Create quote', urgency: 'normal' };
  }

  // 6. Follow-up based on followUpDate (when no operational action is pending)
  if (opp.followUpDate) {
    const todayStart = moment().startOf('day');
    const followUp = moment(opp.followUpDate).startOf('day');
    if (followUp.isBefore(todayStart)) {
      return {
        type: 'follow_up',
        label: 'Follow up',
        dueLabel: 'Overdue',
        urgency: 'critical',
        followUpAction: opp.followUpAction,
      };
    }
    if (followUp.isSame(todayStart)) {
      return {
        type: 'follow_up',
        label: 'Follow up',
        dueLabel: 'Due Today',
        urgency: 'warning',
        followUpAction: opp.followUpAction,
      };
    }
    if (followUp.isAfter(todayStart)) {
      const days = followUp.diff(todayStart, 'days');
      return {
        type: 'follow_up',
        label: 'Follow up',
        dueLabel: days === 1 ? 'Due Tomorrow' : `Due in ${days} days`,
        urgency: 'normal',
        followUpAction: opp.followUpAction,
      };
    }
  }

  // No action applicable
  return null;
};

export const create = async (payload: any) => {
  return await sequelize.transaction(async (transaction) => {
    if (payload.customerId && payload.clientId) {
      const customer = await scoped(models.Customer).findOne({
        where: { id: payload.customerId, clientId: payload.clientId },
        transaction
      });
      if (customer) {
        if (customer.taxExempt) {
          payload.taxRate = 0;
        } else if (customer.salesTaxId) {
          const tax = SALES_TAX.find((t) => t.id === customer.salesTaxId);
          if (tax) {
            payload.taxRate = tax.value;
          }
        }
      }
    }
    return await opportunityRepository.createOpportunity(payload, transaction);
  });
};

export const getAll = async (
  clientId: number,
  page: number = 1,
  limit: number = 20,
  search?: string,
  filter?: any
) => {
  const result = await opportunityRepository.getAllOpportunities(clientId, page, limit, search, filter);
  result.data = result.data.map((item: any) => {
    const opp = item.get ? item.get({ plain: true }) : item;
    opp.nextAction = computeNextAction(opp);
    return opp;
  });
  return result;
};

export const getOne = async (id: number, clientId: number) => {
  return await opportunityRepository.getOpportunityById(id, clientId);
};

export const update = async (id: number, clientId: number, payload: any) => {
  return await sequelize.transaction(async (transaction) => {
    if (payload.customerId) {
      const customer = await scoped(models.Customer).findOne({
        where: { id: payload.customerId, clientId },
        transaction
      });
      if (customer) {
        if (customer.taxExempt) {
          payload.taxRate = 0;
        } else if (customer.salesTaxId) {
          const tax = SALES_TAX.find((t) => t.id === customer.salesTaxId);
          if (tax) {
            payload.taxRate = tax.value;
          }
        }
      }
    }
    return await opportunityRepository.updateOpportunity(id, clientId, payload, transaction);
  });
};

export const remove = async (id: number, clientId: number) => {
  return await sequelize.transaction(async (transaction) => {
    return await opportunityRepository.deleteOpportunity(id, clientId, transaction);
  });
};

export const addRequirement = async (
  opportunityId: number,
  clientId: number,
  payload: {
    productId: number;
    unitType: "slabs" | "sqft";
    requiredCount: number;
    minLength?: number;
    minWidth?: number;
  },
  locationId?: number
) => {
  return await sequelize.transaction(async (transaction) => {
    const opp = await opportunityRepository.getOpportunityById(opportunityId, clientId, transaction);
    if (!opp) throw new AppError("Opportunity not found", 404);
    if (opp.status === "SALES_ORDER") throw new AppError("Cannot add requirements as a Sales Order has already been generated.", 400);

    // 1. Business logic: Find active available inventory products for auto-allocation (excluding on hold)
    const availableInventory = await getAvailableInventoryProductsForProduct(
      payload.productId,
      clientId,
      50,
      locationId,
      payload.minLength,
      payload.minWidth,
      transaction
    );

    if (availableInventory.length === 0) {
      throw new AppError("No matching inventory found for the specified conditions.", 400);
    }

    // 2. Create requirement line database record
    const requirement = await opportunityRepository.createRequirementProduct(
      {
        clientId,
        opportunityId,
        productId: payload.productId,
        unitType: payload.unitType,
        requiredCount: payload.requiredCount,
        allocatedCount: 0,
        status: "PENDING",
        minLength: payload.minLength,
        minWidth: payload.minWidth,
      },
      transaction
    );

    let allocatedCount = 0;
    const allocationsToCreate: any[] = [];
    const needed = Number(payload.requiredCount);

    for (const inv of availableInventory) {
      if (allocatedCount >= needed) break;
      allocationsToCreate.push({
        clientId,
        opportunityId,
        requirementProductId: requirement.id,
        inventoryProductId: inv.id,
        status: "RESERVED",
      });
      allocatedCount += 1;
    }

    // 3. Persist allocations to database if any available
    if (allocationsToCreate.length > 0) {
      await opportunityRepository.createAllocations(allocationsToCreate, transaction);
    }

    // 4. Calculate requirement status business logic
    let status = "PENDING";
    if (allocatedCount >= needed && needed > 0) {
      status = "COMPLETE";
    } else if (allocatedCount > 0) {
      status = "PARTIAL";
    }

    // 5. Update requirement line status & count
    await opportunityRepository.updateRequirementProduct(
      requirement.id,
      clientId,
      {
        allocatedCount,
        status,
      },
      transaction
    );

    const requirementsList = await opportunityRepository.getRequirementLinesAndAllocations(
      opportunityId,
      clientId,
      transaction
    );
    return { requirements: requirementsList, allocatedCount };
  });
};

export const getRequirementsAndAllocations = async (opportunityId: number, clientId: number) => {
  return await opportunityRepository.getRequirementLinesAndAllocations(opportunityId, clientId);
};

export const updateRequirementAllocations = async (
  opportunityId: number,
  requirementId: number,
  clientId: number,
  inventoryProductIds: number[]
) => {
  return await sequelize.transaction(async (transaction) => {
    const opp = await opportunityRepository.getOpportunityById(opportunityId, clientId, transaction);
    if (!opp) throw new AppError("Opportunity not found", 404);
    if (opp.status === "SALES_ORDER") throw new AppError("Cannot update requirement allocations as a Sales Order has already been generated.", 400);

    // 1. Find requirement line
    const requirement = await opportunityRepository.getRequirementProductById(
      requirementId,
      opportunityId,
      clientId,
      transaction
    );

    if (!requirement) {
      throw new AppError("Requirement line not found", 404);
    }

    const requestedIds = Array.isArray(inventoryProductIds)
      ? inventoryProductIds.map(Number)
      : [];

    if (requestedIds.length > 0) {
      // 2. Fetch available inventory items for this product
      const availableInventory = await getAvailableInventoryProductsForProduct(
        requirement.productId,
        clientId,
        undefined, // limit
        undefined, // locationId
        requirement.minLength,
        requirement.minWidth,
        transaction
      );
      const availableSet = new Set(availableInventory.map((item: any) => item.id));

      // Also include items currently allocated to this requirement line
      const existingAllocations = await opportunityRepository.getAllocationsByRequirementId(
        requirementId,
        clientId,
        transaction
      );
      existingAllocations.forEach((alloc: any) => availableSet.add(alloc.inventoryProductId));

      // 3. Business logic check: Ensure all requested inventory product IDs are valid & available
      const invalidIds = requestedIds.filter((id) => !availableSet.has(id));
      if (invalidIds.length > 0) {
        throw new AppError(
          `Selected inventory item(s) #${invalidIds.join(", #")} are no longer available for allocation`,
          400
        );
      }
    }

    // 4. Delete existing allocations for this requirement line
    await opportunityRepository.deleteAllocationsByRequirementId(
      requirementId,
      clientId,
      transaction
    );

    // 5. Create new allocations
    if (requestedIds.length > 0) {
      const allocationsToCreate = requestedIds.map((invId) => ({
        clientId,
        opportunityId,
        requirementProductId: requirementId,
        inventoryProductId: invId,
        status: "RESERVED",
      }));

      await opportunityRepository.createAllocations(allocationsToCreate, transaction);
    }

    // 6. Calculate status & allocated count business logic
    const allocatedCount = requestedIds.length;
    const needed = Number(requirement.requiredCount || 0);

    let status = "PENDING";
    if (allocatedCount >= needed && needed > 0) {
      status = "COMPLETE";
    } else if (allocatedCount > 0) {
      status = "PARTIAL";
    }

    // 7. Update requirement record
    await opportunityRepository.updateRequirementProduct(
      requirementId,
      clientId,
      {
        allocatedCount,
        status,
      },
      transaction
    );

    return await opportunityRepository.getRequirementLinesAndAllocations(
      opportunityId,
      clientId,
      transaction
    );
  });
};

export const removeRequirement = async (requirementId: number, clientId: number) => {
  return await sequelize.transaction(async (transaction) => {
    const requirement = await scoped(models.OpportunityRequirementProduct).findOne({
      where: { id: requirementId, clientId },
      transaction,
    });
    if (!requirement) throw new AppError("Requirement line not found", 404);

    const opp = await opportunityRepository.getOpportunityById(requirement.opportunityId, clientId, transaction);
    if (opp && opp.status === "SALES_ORDER") throw new AppError("Cannot remove requirements as a Sales Order has already been generated.", 400);

    return await opportunityRepository.deleteRequirementLine(requirementId, clientId, transaction);
  });
};

export const getHold = async (opportunityId: number, clientId: number) => {
  return await holdRepository.getHoldByOpportunityId(opportunityId, clientId);
};

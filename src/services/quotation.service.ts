import * as quotationRepository from "../repositories/quotation.repository";
import * as opportunityRepository from "../repositories/opportunity.repository";
import * as holdRepository from "../repositories/hold.repository";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { checkInventoryProductAvailability, checkInventoryProductsAvailabilityByIds } from "./inventoryProduct.service";


export const getQuotations = async (opportunityId: number, clientId: number) => {
  return await quotationRepository.getQuotationsByOpportunityId(opportunityId, clientId);
};

export const getQuotation = async (quotationId: number, clientId: number) => {
  const quote = await quotationRepository.getQuotationById(quotationId, clientId);
  if (!quote) {
    throw new AppError("Quotation not found", 404);
  }
  return quote;
};

export const createQuotation = async (
  opportunityId: number,
  clientId: number,
  payload: {
    inventoryItems?: Array<{
      inventoryProductId: number;
      sellingRate?: number;
      amount?: number;
      priceSource?: string;
    }>;
    notes?: string;
  }
) => {
  return await sequelize.transaction(async (transaction) => {
    // 1. Fetch existing quotations for this opportunity
    const existingQuotations = await quotationRepository.getQuotationsByOpportunityId(
      opportunityId,
      clientId
    );

    // Check if a DRAFT quotation already exists (Max 1 Draft rule)
    const existingDraft = existingQuotations.find((q: any) => q.status === "DRAFT");
    if (existingDraft) {
      throw new AppError("A draft quotation already exists for this opportunity. Cannot create another draft.", 400);
    }

    // 2. Fetch current requirement lines & allocations if items not explicitly passed
    let itemsToProcess = payload.inventoryItems || [];

    if (itemsToProcess.length === 0) {
      const requirements = await opportunityRepository.getRequirementLinesAndAllocations(
        opportunityId,
        clientId
      );

      const createdItems: any[] = [];
      requirements.forEach((req: any) => {
        const allocations = req.inventoryAllocations || [];
        const rawPrice = req.product?.sellingPrice;
        const parsedRate = Number(rawPrice);
        const defaultRate = isNaN(parsedRate) || rawPrice === null || rawPrice === undefined ? 0 : parsedRate;

        allocations.forEach((alloc: any) => {
          const area = Number(alloc.inventoryProduct?.areaSqFt || 0);
          const rate = defaultRate;
          const amount = area > 0 ? area * rate : rate;

          createdItems.push({
            inventoryProductId: alloc.inventoryProductId,
            sellingRate: isNaN(rate) ? 0 : rate,
            amount: isNaN(amount) ? 0 : amount,
            priceSource: "Standard",
          });
        });
      });

      itemsToProcess = createdItems;
    }

    // 3. Compute totals
    const subtotal = itemsToProcess.reduce((acc, item) => {
      const amt = Number(item.amount);
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
    const taxAmount = 0;
    const grandTotal = subtotal;

    // Calculate version based on published quotations + 1
    const publishedCount = existingQuotations.filter((q: any) => q.status !== "DRAFT").length;
    const nextVersion = publishedCount + 1;
    const quoteNumber = `QUO-OPP-${opportunityId}-V${nextVersion}`;

    const quotation = await quotationRepository.createQuotation(
      {
        clientId,
        opportunityId,
        quoteNumber,
        version: nextVersion,
        status: "DRAFT",
        subtotal,
        taxAmount,
        grandTotal,
        notes: payload.notes || "",
      },
      itemsToProcess as any,
      transaction
    );

    // 5. Update opportunity stage / status
    await opportunityRepository.updateOpportunity(
      opportunityId,
      clientId,
      { status: "QUOTATION" },
      transaction
    );

    return quotation;
  });
};

export const publishQuotation = async (
  opportunityId: number,
  quotationId: number,
  clientId: number,
  accountId: number,
  syncHold?: boolean,
  addProductsToHold?: number[],
  locationId?: number
) => {
  return await sequelize.transaction(async (transaction) => {
    const quote: any = await quotationRepository.getQuotationById(quotationId, clientId);
    if (!quote) {
      throw new AppError("Quotation not found", 404);
    }
    if (quote.opportunityId !== Number(opportunityId)) {
      throw new AppError("Quotation does not belong to this opportunity", 400);
    }

    // 1. Verify availability and amount of all allocated inventory products
    const items = quote.quotationInventoryProducts || [];
    
    if (items.length === 0) {
      throw new AppError("Cannot publish an empty quotation. Please add products first.", 400);
    }

    for (const item of items) {
      const sellingRate = item.sellingRate;
      if (sellingRate === null || sellingRate === undefined || Number(sellingRate) === 0) {
        const itemCode = item.inventoryProduct?.combinedNumber || `Item #${item.inventoryProductId || item.id}`;
        throw new AppError(`Cannot publish quotation. Product ${itemCode} has no valid selling rate. Please save prices before publishing.`, 400);
      }
      
      const invProd = item.inventoryProduct;
      if (invProd) {
        if (!checkInventoryProductAvailability(invProd)) {
          const itemCode = invProd.combinedNumber || `Item #${invProd.id}`;
          throw new AppError(`Cannot publish quotation. Inventory product ${itemCode} is no longer available or is on hold.`, 400);
        }
      }
    }

    // 2. Simply update status to PUBLISHED
    await scoped(models.OpportunityQuotation).update(
      { status: "PUBLISHED" },
      { where: { id: quotationId, clientId }, transaction }
    );

    // 3. Sync Hold if requested
    if (syncHold) {
      let hold: any = await holdRepository.getHoldByOpportunityId(opportunityId, clientId, transaction);
      if (!hold) {
        const opportunity: any = await opportunityRepository.getOpportunityById(opportunityId, clientId);
        if (!opportunity) throw new AppError("Opportunity not found", 404);
        
        if (!locationId) throw new AppError("Location ID is required to create a hold", 400);

        hold = await holdRepository.createHold({
          clientId,
          opportunityId,
          createdById: accountId,
          fabricatorId: opportunity.customerId,
          customerId: opportunity.customerId,
          locationId: locationId,
        }, transaction);
        hold.items = [];
      }

      // Compute items to delete (in hold but not in quotation)
      const quoteProductIds = items.map((i: any) => i.inventoryProductId);
      const existingHoldProductIds = (hold.items || []).map((i: any) => i.inventoryProductId);

      const toDeleteHoldItems = (hold.items || []).filter((i: any) => !quoteProductIds.includes(i.inventoryProductId));
      
      for (const holdItem of toDeleteHoldItems) {
        await holdRepository.deleteHoldItem(holdItem.id, transaction);
      }

      // Add requested items
      if (addProductsToHold && addProductsToHold.length > 0) {
        const holdItemsToCreate = addProductsToHold
          .filter((id) => !existingHoldProductIds.includes(id)) // avoid duplicates
          .map((id) => ({
            holdId: hold.id,
            inventoryProductId: id,
            clientId,
          }));
        if (holdItemsToCreate.length > 0) {
          await holdRepository.createHoldItems(holdItemsToCreate, transaction);
        }
      }
    }

    return await quotationRepository.getQuotationById(quotationId, clientId);
  });
};

const recalculateQuotationTotals = async (quotationId: number, clientId: number, transaction: any) => {
  const items = await scoped(models.OpportunityQuotationInventoryProduct).findAll({
    where: { quotationId, clientId },
    transaction
  });

  const subtotal = items.reduce((acc: number, item: any) => acc + (isNaN(Number(item.amount)) ? 0 : Number(item.amount)), 0);
  
  await scoped(models.OpportunityQuotation).update(
    { subtotal, grandTotal: subtotal },
    { where: { id: quotationId, clientId }, transaction }
  );
};

export const updateQuotationRates = async (
  opportunityId: number,
  quotationId: number,
  clientId: number,
  rates: Record<string, number>
) => {
  return await sequelize.transaction(async (transaction) => {
    const quote = await quotationRepository.getQuotationById(quotationId, clientId);
    if (!quote || quote.opportunityId !== opportunityId) throw new AppError("Quotation not found or invalid", 404);
    if (quote.status !== "DRAFT") throw new AppError("Cannot edit a published quotation", 400);

    const items = quote.quotationInventoryProducts || [];
    
    for (const item of items) {
      const productId = String(item.inventoryProduct?.productId);
      if (rates[productId] !== undefined) {
        const newRate = Number(rates[productId]);
        const area = Number(item.inventoryProduct?.areaSqFt || 0);
        const newAmount = area > 0 ? newRate * area : newRate;

        await scoped(models.OpportunityQuotationInventoryProduct).update(
          { sellingRate: newRate, amount: newAmount },
          { where: { id: item.id, clientId, quotationId }, transaction }
        );
      }
    }

    await recalculateQuotationTotals(quotationId, clientId, transaction);
    return await quotationRepository.getQuotationById(quotationId, clientId);
  });
};

export const addQuotationProducts = async (
  opportunityId: number,
  quotationId: number,
  clientId: number,
  inventoryProductIds: number[]
) => {
  return await sequelize.transaction(async (transaction) => {
    const quote = await quotationRepository.getQuotationById(quotationId, clientId);
    if (!quote || quote.opportunityId !== opportunityId) throw new AppError("Quotation not found or invalid", 404);
    if (quote.status !== "DRAFT") throw new AppError("Cannot edit a published quotation", 400);

    const availability = await checkInventoryProductsAvailabilityByIds(clientId, inventoryProductIds);
    if (!availability.allAvailable) {
      throw new AppError(`Cannot add products: ${availability.unavailableItems.map(i => `${i.combinedNumber} (${i.reason})`).join(', ')}`, 400);
    }

    // Filter out already added products
    const existingIds = (quote.quotationInventoryProducts || []).map((i: any) => i.inventoryProductId);
    const newIds = inventoryProductIds.filter(id => !existingIds.includes(id));

    if (newIds.length === 0) {
      return quote;
    }

    const inventoryProducts = await scoped(models.InventoryProduct).findAll({
      where: { id: newIds, clientId },
      include: [{ association: "product" }],
      transaction
    });

    const newItems = inventoryProducts.map((ip: any) => {
      const rate = Number(ip.product?.sellingPrice || 0);
      const area = Number(ip.areaSqFt || 0);
      const amount = area > 0 ? rate * area : rate;
      return {
        clientId,
        quotationId,
        inventoryProductId: ip.id,
        sellingRate: rate,
        amount,
        priceSource: "Standard"
      };
    });

    await scoped(models.OpportunityQuotationInventoryProduct).bulkCreate(newItems, { transaction });
    await recalculateQuotationTotals(quotationId, clientId, transaction);
    
    return await quotationRepository.getQuotationById(quotationId, clientId);
  });
};

export const removeQuotationProduct = async (
  opportunityId: number,
  quotationId: number,
  clientId: number,
  invProductId: number
) => {
  return await sequelize.transaction(async (transaction) => {
    const quote = await quotationRepository.getQuotationById(quotationId, clientId);
    if (!quote || quote.opportunityId !== opportunityId) throw new AppError("Quotation not found or invalid", 404);
    if (quote.status !== "DRAFT") throw new AppError("Cannot edit a published quotation", 400);

    await scoped(models.OpportunityQuotationInventoryProduct).destroy({
      where: { quotationId, clientId, inventoryProductId: invProductId },
      transaction
    });

    await recalculateQuotationTotals(quotationId, clientId, transaction);
    return await quotationRepository.getQuotationById(quotationId, clientId);
  });
};

import { AppError } from "../helper/appError";
import * as creditDebitNoteRepository from "../repositories/creditDebitNote.repository";
import { CreateCreditDebitNoteInput, UpdateCreditDebitNoteInput } from "../validators/creditDebitNote.validator";
import { requestContext } from "../utils/requestContext";
import * as siplRepository from "../repositories/sipl.repository";
import * as journalEntryService from "./journalEntry.service";
import { CREDIT_NOTE_REFERENCE_TYPES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import * as models from "../models";
import * as siplService from "./sipl.service";
import _ from "lodash";
import { INVENTORY_ITEM_STATUS } from "../constants";
import * as decimal from "../helper/decimal";

// Create a new credit/debit note
export const createCreditDebitNote = async (creditDebitNoteData: CreateCreditDebitNoteInput & { clientId: number }) => {
    const transaction = await sequelize.transaction();
    try {
        const creditDebitNote: any = await creditDebitNoteRepository.createCreditDebitNote(creditDebitNoteData, transaction);

        if (creditDebitNoteData.referenceType === CREDIT_NOTE_REFERENCE_TYPES.SIPL && creditDebitNoteData.referenceId) {
            const siplData = await siplRepository.findSIPLById(creditDebitNoteData.referenceId, transaction);
            if (!siplData) throw new AppError("SIPL not found", 404);

            const impact = creditDebitNoteData.inventoryImpactType || 'cost_revaluation';
            let cogsAmount = 0;
            let finishedGoodsAmount = 0;

            if (impact === 'none' || impact === 'No Inventory Impact') {
                // No Inventory Impact: All credit amount goes to COGS directly (reducing cost)
                cogsAmount = Number(creditDebitNoteData.amount);
                finishedGoodsAmount = 0;
            } else if (impact === 'quantity_reduction' || impact === 'Quantity Reduction') {
                // Quantity Reduction: selected slabs are removed/canceled
                const selectedSlabIds = (creditDebitNoteData as any).selectedSlabIds;
                if (!selectedSlabIds || !Array.isArray(selectedSlabIds) || selectedSlabIds.length === 0) {
                    throw new AppError("selectedSlabIds must be provided as a non-empty array for Quantity Reduction", 400);
                }

                const slabs = await models.Slab.findAll({
                    where: { id: selectedSlabIds },
                    include: [{ association: "inventoryProduct" }],
                    transaction
                });

                if (slabs.length !== selectedSlabIds.length) {
                    throw new AppError("Some selected slabs were not found", 404);
                }

                for (const slab of slabs) {
                    const ip = (slab as any).inventoryProduct;
                    if (!ip) {
                        throw new AppError(`Inventory product not found for slab ${(slab as any).id}`, 404);
                    }

                    if (ip.siplId !== creditDebitNoteData.referenceId) {
                        throw new AppError(`Slab ${(slab as any).id} does not belong to this SIPL`, 400);
                    }

                    if (ip.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
                        throw new AppError(`Only unsold slabs (IN_INVENTORY) can be removed. Slab ${(slab as any).id} is in status ${ip.status}`, 400);
                    }

                    finishedGoodsAmount = Number(decimal.decimalAdd(finishedGoodsAmount, Number(ip.assetValue || 0)));

                    // Cancel the inventory product and slab
                    await ip.update({ status: INVENTORY_ITEM_STATUS.CANCELED }, { transaction });
                    await slab.update({ status: INVENTORY_ITEM_STATUS.CANCELED }, { transaction });
                }

                // The difference between creditNote amount and finished goods amount goes to COGS
                cogsAmount = Number(decimal.decimalSubtract(Number(creditDebitNoteData.amount), finishedGoodsAmount));
            } else {
                // Cost Revaluation
                const siplCalc = await siplService.getSiplCalculations(creditDebitNoteData.referenceId, transaction);
                const totalSiplAmount = Number(siplCalc.totalAmount || 0);

                const existingCreditNotes: any[] = await models.CreditDebitNote.findAll({
                    where: { referenceType: CREDIT_NOTE_REFERENCE_TYPES.SIPL, referenceId: creditDebitNoteData.referenceId },
                    transaction
                });
                const existingCreditAmount = _.sumBy(existingCreditNotes, (cn: any) => parseFloat(cn.amount)) || 0;

                if (creditDebitNoteData.amount > (totalSiplAmount - existingCreditAmount)) {
                    throw new AppError(`Credit note amount cannot exceed remaining SIPL amount of ${(totalSiplAmount - existingCreditAmount).toFixed(2)}`, 400);
                }

                const totalQuantity = siplCalc.totalQuantity;
                const unitCreditAmount = totalQuantity > 0 ? decimal.decimalDivide(creditDebitNoteData.amount, totalQuantity) : 0;

                const inventoryProducts = await models.InventoryProduct.findAll({
                    where: { siplId: creditDebitNoteData.referenceId },
                    include: [{ association: "slab" }],
                    transaction
                });

                for (const ip of inventoryProducts) {
                    let ipQuantity = 0;
                    if ((ip as any).isSlabType && (ip as any).slab) {
                        const slab = (ip as any).slab;
                        const length = Number(slab.packageLength) || 0;
                        const width = Number(slab.packageWidth) || 0;
                        ipQuantity = (length * width) / 144;
                    } else {
                        ipQuantity = 1;
                    }

                    const ipCreditAmount = Number(decimal.decimalMultiply(unitCreditAmount, ipQuantity));

                    if ((ip as any).status === INVENTORY_ITEM_STATUS.SOLD) {
                        cogsAmount = Number(decimal.decimalAdd(cogsAmount, ipCreditAmount));
                    } else {
                        finishedGoodsAmount = Number(decimal.decimalAdd(finishedGoodsAmount, ipCreditAmount));
                        
                        // Update landedUnitCost and assetValue for unsold inventory products
                        const currentLandedUnitCost = Number((ip as any).landedUnitCost) || 0;
                        const newLandedUnitCost = Number(decimal.decimalSubtract(currentLandedUnitCost, unitCreditAmount));
                        const newAssetValue = Number(decimal.decimalMultiply(newLandedUnitCost, ipQuantity));
                        
                        await ip.update({ 
                            landedUnitCost: newLandedUnitCost, 
                            assetValue: newAssetValue 
                        }, { transaction });
                    }
                }
            }

            // Update credit note with the inventory adjustment value (which is finishedGoodsAmount)
            await creditDebitNote.update({
                inventoryAdjustmentValue: finishedGoodsAmount
            }, { transaction });

            await journalEntryService.createJournalEntriesForSiplCreditNote(creditDebitNote, siplData, cogsAmount, finishedGoodsAmount, creditDebitNoteData.clientId, transaction);
        }

        await transaction.commit();
        return await creditDebitNoteRepository.getCreditDebitNoteById(creditDebitNote.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Get all credit/debit notes with pagination
export const getCreditDebitNotes = async (filters: any, page: number = 1, limit: number = 10) => {
    return await creditDebitNoteRepository.getAllCreditDebitNotes(filters, page, limit);
};

// Get credit/debit note by ID
export const getCreditDebitNote = async (id: number) => {
    const creditDebitNote = await creditDebitNoteRepository.getCreditDebitNoteById(id);
    if (!creditDebitNote) {
        throw new AppError("Credit/Debit note not found", 404);
    }
    return creditDebitNote;
};

// Update credit/debit note
export const updateCreditDebitNote = async (id: number, updateData: UpdateCreditDebitNoteInput, clientId: number) => {
    // Check if credit/debit note exists and belongs to client
    const existingNote: any = await creditDebitNoteRepository.getCreditDebitNoteById(id);
    if (!existingNote) {
        throw new AppError("Credit/Debit note not found", 404);
    }

    if (existingNote.clientId !== clientId) {
        throw new AppError("You don't have permission to update this credit/debit note", 403);
    }

    const updatedNote = await creditDebitNoteRepository.updateCreditDebitNote(id, updateData);
    return updatedNote;
};


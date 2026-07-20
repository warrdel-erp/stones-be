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

export const createCreditDebitNote = async (
    creditDebitNoteData: CreateCreditDebitNoteInput & { clientId: number },
    transaction?: any
) => {
    const isExternalTransaction = !!transaction;
    const t = transaction || await sequelize.transaction();
    try {
        const creditDebitNote: any = await creditDebitNoteRepository.createCreditDebitNote(creditDebitNoteData, t);


        if (!isExternalTransaction) {
            await t.commit();
        }
        return await creditDebitNoteRepository.getCreditDebitNoteById(creditDebitNote.id, t);
    } catch (error) {
        if (!isExternalTransaction) {
            await t.rollback();
        }
        throw error;
    }
};

export const createAndSettleSiplCreditNote = async (creditDebitNoteData: CreateCreditDebitNoteInput & { clientId: number }) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Create Note
        const creditDebitNote: any = await createCreditDebitNote(creditDebitNoteData, transaction);
        console.log("DEBUG: creditDebitNote returned from createCreditDebitNote:", creditDebitNote ? creditDebitNote.id : null);

        // 2. Settle the note with the given SIPL
        await _settleCreditDebitNoteInternal(
            creditDebitNote,
            CREDIT_NOTE_REFERENCE_TYPES.SIPL,
            creditDebitNoteData.referenceId as number,
            Number(creditDebitNoteData.amount),
            creditDebitNoteData.clientId,
            transaction
        );

        await transaction.commit();
        return await creditDebitNoteRepository.getCreditDebitNoteById(creditDebitNote.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const settleCreditDebitNote = async (
    creditDebitNoteId: number,
    referenceType: string,
    referenceId: number,
    amount: number,
    clientId: number
) => {
    const transaction = await sequelize.transaction();
    try {
        const creditDebitNote: any = await creditDebitNoteRepository.getCreditDebitNoteById(creditDebitNoteId, transaction);
        if (!creditDebitNote) throw new AppError("Credit/Debit Note not found", 404);

        const settlement = await _settleCreditDebitNoteInternal(
            creditDebitNote,
            referenceType,
            referenceId,
            amount,
            clientId,
            transaction
        );
        await transaction.commit();
        return settlement;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const _settleCreditDebitNoteInternal = async (
    creditDebitNote: any,
    referenceType: string,
    referenceId: number,
    amount: number,
    clientId: number,
    transaction: any
) => {
    const creditDebitNoteId = creditDebitNote.id;

    if (creditDebitNote.clientId !== clientId) {
        throw new AppError("Unauthorized access to this note", 403);
    }

    const existingSettlements = await creditDebitNoteRepository.getSettlementsByCreditDebitNoteId(creditDebitNoteId, transaction);
    const totalSettled = decimal.decimalSum(existingSettlements.map((s: any) => parseFloat(s.amount) || 0));
    const noteAmount = parseFloat(creditDebitNote.amount);

    if (decimal.decimalGreaterThan(Number(decimal.decimalAdd(totalSettled, amount)), noteAmount)) {
        throw new AppError(`Cannot settle more than the note amount. Remaining balance is ${decimal.decimalSubtract(noteAmount, totalSettled).toFixed(2)}`, 400);
    }

    const settlement = await creditDebitNoteRepository.createSettlement({
        creditDebitNoteId,
        referenceType,
        referenceId,
        amount,
        clientId
    }, transaction);

    if (referenceType === CREDIT_NOTE_REFERENCE_TYPES.SIPL) {
        const siplId = referenceId;
        const siplData = await siplRepository.findSIPLById(siplId, transaction);
        if (!siplData) throw new AppError("SIPL not found", 404);

        const { cogsAmount, finishedGoodsAmount } = await handleCostRevaluationSettlement(siplId, amount, transaction);

        await journalEntryService.createJournalEntriesForSiplCreditNote(creditDebitNote, siplData, cogsAmount, finishedGoodsAmount, clientId, transaction);
    }

    return settlement;
};

const handleQuantityReductionSettlement = (creditDebitNote: any, amount: number, noteAmount: number) => {
    const totalNoteFinishedGoods = parseFloat(creditDebitNote.inventoryAdjustmentValue || "0");
    const proportion = decimal.decimalDivide(amount, noteAmount);
    const finishedGoodsAmount = Number(decimal.decimalMultiply(totalNoteFinishedGoods, proportion));
    const cogsAmount = Number(decimal.decimalSubtract(amount, finishedGoodsAmount));

    return { cogsAmount, finishedGoodsAmount };
};

const handleCostRevaluationSettlement = async (siplId: number, amount: number, transaction: any) => {
    let cogsAmount = 0;
    let finishedGoodsAmount = 0;

    const siplCalc = await siplService.getSiplCalculations(siplId, transaction);
    const totalSiplAmount = Number(siplCalc.totalAmount || 0);

    const existingSIPLNotes: any[] = await creditDebitNoteRepository.getSettlementsByReference(siplId, CREDIT_NOTE_REFERENCE_TYPES.SIPL, transaction);
    const existingSIPLSettledAmount = decimal.decimalSubtract(decimal.decimalSum(existingSIPLNotes.map((s: any) => parseFloat(s.amount) || 0)), amount);

    if (decimal.decimalGreaterThan(amount, decimal.decimalSubtract(totalSiplAmount, existingSIPLSettledAmount))) {
        throw new AppError(`Settlement amount cannot exceed remaining SIPL balance of ${decimal.decimalSubtract(totalSiplAmount, existingSIPLSettledAmount).toFixed(2)}`, 400);
    }

    const totalQuantity = siplCalc.totalQuantity;
    const unitCreditAmount = totalQuantity > 0 ? decimal.decimalDivide(amount, totalQuantity) : 0;

    const inventoryProducts = await models.InventoryProduct.findAll({
        where: { siplId },
        include: [{ association: "slab" }],
        transaction
    });

    for (const ip of inventoryProducts) {
        let ipQuantity = 0;
        if ((ip as any).isSlabType && (ip as any).slab) {
            const slab = (ip as any).slab;
            const length = Number(slab.packageLength) || 0;
            const width = Number(slab.packageWidth) || 0;
            ipQuantity = decimal.decimalDivide(decimal.decimalMultiply(length, width), 144);
        } else {
            ipQuantity = 1;
        }

        const ipCreditAmount = Number(decimal.decimalMultiply(unitCreditAmount, ipQuantity));

        if ((ip as any).status === INVENTORY_ITEM_STATUS.SOLD || (ip as any).status === INVENTORY_ITEM_STATUS.CANCELED) {
            cogsAmount = Number(decimal.decimalAdd(cogsAmount, ipCreditAmount));
        } else {
            finishedGoodsAmount = Number(decimal.decimalAdd(finishedGoodsAmount, ipCreditAmount));

            const currentLandedUnitCost = Number((ip as any).landedUnitCost) || 0;
            const newLandedUnitCost = Number(decimal.decimalSubtract(currentLandedUnitCost, unitCreditAmount));
            const newAssetValue = Number(decimal.decimalMultiply(newLandedUnitCost, ipQuantity));

            await ip.update({
                landedUnitCost: newLandedUnitCost,
                assetValue: newAssetValue
            }, { transaction });
        }
    }

    return { cogsAmount, finishedGoodsAmount };
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


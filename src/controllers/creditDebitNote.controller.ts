import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as creditDebitNoteService from "../services/creditDebitNote.service";
import { AppError } from "../helper/appError";
// Create and settle credit/debit note for SIPL
export const createAndSettleSiplCreditNote = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Client ID is required", 400);
    }

    const creditDebitNote = await creditDebitNoteService.createAndSettleSiplCreditNote({
        ...req.body,
        clientId,
    });

    return SuccessResponse(res, 201, "Credit/Debit note for SIPL created and settled successfully", creditDebitNote);
});

// Get all credit/debit notes
export const getAllCreditDebitNotes = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Client ID is required", 400);
    }

    const result = await creditDebitNoteService.getCreditDebitNotes(
        { ...filters, clientId },
        Number(page),
        Number(limit)
    );

    return SuccessResponse(res, 200, "Credit/Debit notes fetched successfully", result.creditDebitNotes, {
        total: result.total,
        page: result.page,
        limit: result.limit,
    });
});

// Get credit/debit note by ID
export const getCreditDebitNoteById = catchAsync(async (req: Request, res: Response) => {
    const creditDebitNote = await creditDebitNoteService.getCreditDebitNote(Number(req.params.id));

    return SuccessResponse(res, 200, "Credit/Debit note retrieved successfully", creditDebitNote);
});

// Update credit/debit note
export const updateCreditDebitNote = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Client ID is required", 400);
    }

    const creditDebitNote = await creditDebitNoteService.updateCreditDebitNote(
        Number(req.params.id),
        req.body,
        clientId
    );

    return SuccessResponse(res, 200, "Credit/Debit note updated successfully", creditDebitNote);
});

// Settle credit/debit note
export const settleCreditDebitNote = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("Client ID is required", 400);
    }

    const { referenceType, referenceId, amount } = req.body;
    const creditDebitNoteId = Number(req.params.id);

    const settlement = await creditDebitNoteService.settleCreditDebitNote(
        creditDebitNoteId,
        referenceType,
        referenceId,
        amount,
        clientId
    );

    return SuccessResponse(res, 200, "Credit/Debit note settled successfully", settlement);
});

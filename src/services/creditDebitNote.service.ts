import { AppError } from "../helper/appError";
import * as creditDebitNoteRepository from "../repositories/creditDebitNote.repository";
import { CreateCreditDebitNoteInput, UpdateCreditDebitNoteInput } from "../validators/creditDebitNote.validator";

// Create a new credit/debit note
export const createCreditDebitNote = async (creditDebitNoteData: CreateCreditDebitNoteInput & { clientId: number }) => {
    const creditDebitNote: any = await creditDebitNoteRepository.createCreditDebitNote(creditDebitNoteData);
    return await creditDebitNoteRepository.getCreditDebitNoteById(creditDebitNote.id);
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


import { z } from 'zod';
import { CREDIT_NOTE_REFERENCE_TYPES, CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES } from '../constants/tableTypes';

export const createCreditDebitNoteSchema = z.object({
    amount: z.number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
    }).positive('Amount must be positive'),

    entryFor: z.enum(Object.values(CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES) as [string, ...string[]], {
        required_error: 'Entry for is required',
        invalid_type_error: 'Entry for must be either customer or vendor',
    }),

    entryIdFor: z.number({
        required_error: 'Entry ID for is required',
        invalid_type_error: 'Entry ID for must be a number',
    }).int('Entry ID for must be an integer').positive('Entry ID for must be positive'),

    referenceType: z.enum(Object.values(CREDIT_NOTE_REFERENCE_TYPES) as [string, ...string[]], {
        invalid_type_error: 'Reference type must be a valid type',
    }).optional(),

    referenceId: z.number({
        invalid_type_error: 'Reference ID must be a number',
    }).int('Reference ID must be an integer').positive('Reference ID must be positive').optional(),

    creditNoteNumber: z.string().optional(),
    creditNoteDate: z.string().optional(),
    reasonType: z.string().optional(),
    remarks: z.string().optional(),
    claimReferenceNumber: z.string().optional(),
    inventoryImpactType: z.string().optional(),
    inventoryAdjustmentValue: z.number().optional(),
    selectedSlabIds: z.array(z.number()).optional(),
});

export const updateCreditDebitNoteSchema = z.object({
    amount: z.number({
        invalid_type_error: 'Amount must be a number',
    }).positive('Amount must be positive').optional(),

    entryFor: z.enum(Object.values(CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES) as [string, ...string[]], {
        invalid_type_error: 'Entry for must be either customer or vendor',
    }).optional(),

    entryIdFor: z.number({
        invalid_type_error: 'Entry ID for must be a number',
    }).int('Entry ID for must be an integer').positive('Entry ID for must be positive').optional(),

    referenceType: z.enum(Object.values(CREDIT_NOTE_REFERENCE_TYPES) as [string, ...string[]], {
        invalid_type_error: 'Reference type must be a valid type',
    }).optional(),

    referenceId: z.number({
        invalid_type_error: 'Reference ID must be a number',
    }).int('Reference ID must be an integer').positive('Reference ID must be positive').optional(),
});

export type CreateCreditDebitNoteInput = z.infer<typeof createCreditDebitNoteSchema>;
export type UpdateCreditDebitNoteInput = z.infer<typeof updateCreditDebitNoteSchema>;

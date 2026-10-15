import { z } from "zod";
import { DOCUMENT_NUMBERING_TYPE, SEQUENCE_RESET_FREQUENCY } from "../models/documentNumberingConfig.model";

export const updateDocumentNumberingSchema = z.object({
  body: z.object({
    prefix: z.string().min(1, "Prefix cannot be empty").max(10, "Prefix must be at most 10 characters").optional(),
    includeYear: z.boolean().optional(),
    separator: z.string().max(5, "Separator must be at most 5 characters").optional(),
    numberLength: z.number().int().min(1, "Length must be at least 1").max(10, "Length cannot exceed 10").optional(),
    sequenceReset: z.nativeEnum(SEQUENCE_RESET_FREQUENCY).optional(),
    nextNumber: z.number().int().min(1, "Next number must be at least 1").optional(),
  }),
  params: z.object({
    documentType: z.nativeEnum(DOCUMENT_NUMBERING_TYPE),
  }),
});

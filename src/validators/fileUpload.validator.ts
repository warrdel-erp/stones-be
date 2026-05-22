import { z } from "zod";
import { FILE_UPLOAD_ENTITY_TYPE } from "../constants/tableTypes";

// ─── Generate Upload URL ───────────────────────────────────────────────────────

export const generateUploadUrlSchema = z.object({
  originalName: z
    .string({ required_error: "originalName is required." })
    .min(1, "originalName cannot be empty."),

  mimeType: z
    .string({ required_error: "mimeType is required." })
    .min(1, "mimeType cannot be empty."),

  size: z
    .number({ required_error: "size is required." })
    .int("size must be an integer.")
    .positive("size must be a positive number."),

  entityType: z
    .enum(Object.values(FILE_UPLOAD_ENTITY_TYPE) as [string, ...string[]], {
      errorMap: () => ({
        message: `entityType must be one of: ${Object.values(FILE_UPLOAD_ENTITY_TYPE).join(", ")}`,
      }),
    })
    .optional()
    .nullable(),

  entityId: z.number().int().positive().optional().nullable(),

  companyId: z.number().int().positive().optional().nullable(),
});

export type GenerateUploadUrlInput = z.infer<typeof generateUploadUrlSchema>;

// ─── Confirm Upload ────────────────────────────────────────────────────────────
// (fileId comes from req.params, validated in controller)
export const confirmUploadParamSchema = z.object({
  id: z
    .string({ required_error: "id param is required." })
    .regex(/^\d+$/, "id must be a numeric value."),
});

import { z } from "zod";

export const productSchema = z.object({
    name: z.string({
        required_error: "Product name is required",
    }).min(1, "Product name cannot be empty"),
    alternativeName: z.string().optional().nullable(),
    baseColorId: z.number().int().optional().nullable(),
    groupId: z.number().int().optional().nullable(),
    subCategoryId: z.number({
        required_error: "Subcategory (subCategoryId) is required",
    }).int(),
    originId: z.number().int().optional().nullable(),
    uomId: z.number().int().optional().nullable(),
    weight: z.number().optional().nullable(),
    finishId: z.number().int().optional().nullable(),
    kindId: z.number({
        required_error: "Kind (kindId) is required",
    }).int(),
    thickness: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
    specialInstruction: z.string().optional().nullable(),
    disclaimer: z.string().optional().nullable(),
    isSlabType: z.boolean().default(false),
    singleUnitPrice: z.number().optional().nullable(),
    bundlePrice: z.number().optional().nullable(),
    reorderQuantity: z.number().optional().nullable(),
    safetyQuantity: z.number().optional().nullable(),
    binId: z.number().int().optional().nullable(),
    status: z.enum(["active", "inactive"]).default("active"),
});

export type ProductInput = z.infer<typeof productSchema>;

import { z } from "zod";

export const productSchema = z.object({
    name: z.string({
        required_error: "Product name is required",
    }).min(1, "Product name cannot be empty"),
    alternativeName: z.string({
        required_error: "Alternative name is required",
    }).min(1, "Alternative name cannot be empty"),
    baseColorId: z.number().int().optional().nullable(),
    groupId: z.number({
        required_error: "Category (groupId) is required",
    }).int(),
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
    singleUnitPrice: z.number({
        required_error: "Single unit price is required",
    }),
    bundlePrice: z.number().optional().nullable(),
    reorderQuantity: z.number().optional().nullable(),
    safetyQuantity: z.number().optional().nullable(),
    binId: z.number({
        required_error: "Bin ID is required",
    }).int(),
    status: z.enum(["active", "inactive"]).default("active"),
});

export type ProductInput = z.infer<typeof productSchema>;

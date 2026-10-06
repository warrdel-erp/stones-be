import { z } from "zod";

export const addRequirementLineSchema = z.object({
  productId: z.number({ required_error: "Product is required" }).int(),
  unitType: z.enum(["slabs", "sqft"]).default("slabs"),
  requiredCount: z.coerce.number().min(1, "Required count must be at least 1"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  minLength: z.coerce.number().optional(),
  minWidth: z.coerce.number().optional(),
  lineDiscountPercentage: z.coerce.number().min(0).max(100).transform((v) => Math.round(v * 100) / 100).optional().default(0),
  autoAllocate: z.boolean().optional().default(true),
  inventoryProductIds: z.array(z.number().int()).optional(),
});

export const updateAllocationsSchema = z.object({
  inventoryProductIds: z.array(z.number().int()),
});

export const updateLineDiscountSchema = z.object({
  lineDiscountPercentage: z.coerce
    .number({ required_error: "Line discount is required" })
    .min(0)
    .max(100)
    .transform((v) => Math.round(v * 100) / 100),
});

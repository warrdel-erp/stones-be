import { z } from "zod";

export const addRequirementLineSchema = z.object({
  productId: z.number({ required_error: "Product is required" }).int(),
  unitType: z.enum(["slabs", "sqft"]).default("slabs"),
  requiredCount: z.coerce.number().min(1, "Required count must be at least 1"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  taxApplied: z.boolean().optional().default(true),
  minLength: z.coerce.number().optional(),
  minWidth: z.coerce.number().optional(),
});

export const updateAllocationsSchema = z.object({
  inventoryProductIds: z.array(z.number().int()),
});

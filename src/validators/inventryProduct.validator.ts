import { z } from 'zod';

export const inventoryProductSchema = z.object({
    id: z.number({
        required_error: "Inventory product ID is required",
        invalid_type_error: "ID must be a number",
    }),

    binId: z.coerce.number({
        required_error: "Bin ID is required",
        invalid_type_error: "Bin ID must be a number",
    })
});

export const inventoryProductArraySchema = z
    .array(inventoryProductSchema)
    .min(1, "At least one inventory product is required");

export type inventoryProductInput = z.infer<typeof inventoryProductSchema>;
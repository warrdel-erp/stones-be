import { z } from 'zod';

export const inventryProductSchema = z.object({
    id: z.number({
        required_error: "Inventory product ID is required",
        invalid_type_error: "ID must be a number",
    }),

    binId: z.coerce.number({
        required_error: "Bin ID is required",
        invalid_type_error: "Bin ID must be a number",
    })
});

export const inventryProductArraySchema = z
    .array(inventryProductSchema)
    .min(1, "At least one inventory product is required");

export type inventryProductInput = z.infer<typeof inventryProductSchema>;
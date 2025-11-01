import { z } from 'zod';

export const createCartItemSchema = z.object({
    inventoryProductId: z.number({
        required_error: 'Inventory product ID is required',
        invalid_type_error: 'Inventory product ID must be a number',
    }).int('Inventory product ID must be an integer').positive('Inventory product ID must be positive'),
});

export type CreateCartItemInput = z.infer<typeof createCartItemSchema>;


import { z } from 'zod';

export const createServiceCategorySchema = z.object({
    name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
    }).min(1, 'Name cannot be empty'),

    type: z.enum(['purchase', 'sale'], {
        required_error: 'Type is required',
        invalid_type_error: 'Type must be either "purchase" or "sale"',
    }),

});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>; 
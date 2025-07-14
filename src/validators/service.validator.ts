import { z } from 'zod';

export const createServiceSchema = z.object({
    name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
    }).min(1, 'Name cannot be empty'),

    ledgerAccountId: z.number({
        required_error: 'Ledger Account id is required',
        invalid_type_error: 'Ledger Account must be a number',
    }).int('Ledger Account must be an integer').positive('Ledger Account must be positive'),

    uom: z.number({
        required_error: 'UOM is required',
        invalid_type_error: 'UOM must be a number',
    }).int('UOM must be an integer').positive('UOM must be positive'),

    basePrice: z.number({
        required_error: 'basePrice is required',
        invalid_type_error: 'basePrice must be a number',
    }).positive('basePrice must be positive'),

    description: z.string({
        invalid_type_error: 'Description must be a string',
    }).optional(),

    serviceCategoryId: z.number({
        required_error: 'Service Category ID is required',
        invalid_type_error: 'Service Category ID must be a number',
    }).int('Service Category ID must be an integer').positive('Service Category ID must be positive'),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>; 
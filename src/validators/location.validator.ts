import { z } from 'zod';

export const createLocationSchema = z.object({
    locationName: z.string({
        required_error: 'Location name is required',
        invalid_type_error: 'Location name must be a string',
    }).min(1, 'Location name cannot be empty'),

    contactName: z.string({
        required_error: 'Contact name is required',
        invalid_type_error: 'Contact name must be a string',
    }).min(1, 'Contact name cannot be empty'),

    contactNumber: z.string({
        required_error: 'Contact number is required',
        invalid_type_error: 'Contact number must be a string',
    }).length(10, 'Contact number must be exactly 10 digits'),

    contactMail: z.string({
        required_error: 'Contact email is required',
        invalid_type_error: 'Contact email must be a string',
    }).email('Invalid email format'),

    address: z.string({
        required_error: 'Address is required',
        invalid_type_error: 'Address must be a string',
    }).min(1, 'Address cannot be empty'),

    addressLine: z.string({
        invalid_type_error: 'Address line must be a string',
    }).optional(),

    lat: z.number({
        invalid_type_error: 'Latitude must be a number',
    }).optional(),

    long: z.number({
        invalid_type_error: 'Longitude must be a number',
    }).optional(),

    status: z.enum(['active', 'inactive'], {
        invalid_type_error: 'Status must be either "active" or "inactive"',
    }).optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

import { z } from 'zod';

export const createUserByAccountSchema = z.object({
    username: z.string({
        required_error: 'Username is required',
        invalid_type_error: 'Username must be a string',
    }).min(1, 'Username cannot be empty'),

    userid: z.string({
        required_error: 'User ID is required',
        invalid_type_error: 'User ID must be a string',
    }).min(1, 'User ID cannot be empty'),

    email: z.string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
    }).email('Invalid email format'),

    password: z.string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
    }).min(6, 'Password must be at least 6 characters'),

    phone: z.string({
        required_error: 'Phone is required',
        invalid_type_error: 'Phone must be a string',
    }).min(1, 'Phone cannot be empty'),

    defaultLocationId: z.number({
        invalid_type_error: 'Default Location ID must be a number',
    }).int('Default Location ID must be an integer').positive('Default Location ID must be positive').optional(),
});

export type CreateUserByAccountInput = z.infer<typeof createUserByAccountSchema>;

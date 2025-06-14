import { z } from 'zod';

export const createAdvancedDepositSchema = z.object({
    amount: z.number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
    }).positive('Amount must be positive'),

    salesOrderId: z.number({
        required_error: 'Sales order ID is required',
        invalid_type_error: 'Sales order ID must be a number',
    }).int('Sales order ID must be an integer').positive('Sales order ID must be positive'),

    paymentMethod: z.string({
        required_error: 'Payment method is required',
        invalid_type_error: 'Payment method must be a string',
    }).min(1, 'Payment method cannot be empty'),

    accountId: z.number({
        required_error: 'Account ID is required',
        invalid_type_error: 'Account ID must be a number',
    }).int('Account ID must be an integer').positive('Account ID must be positive'),
});

export type CreateAdvancedDepositInput = z.infer<typeof createAdvancedDepositSchema>; 
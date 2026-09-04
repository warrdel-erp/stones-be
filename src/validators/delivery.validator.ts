import { z } from 'zod';

const orderItemSchema = z.object({
    id: z.number({
        required_error: 'Order ID is required',
        invalid_type_error: 'Order ID must be a number',
    }).int('Order ID must be an integer').positive('Order ID must be positive'),
    order: z.number({
        required_error: 'Order number is required',
        invalid_type_error: 'Order number must be a number',
    }).int('Order number must be an integer').min(0, 'Order number must be non-negative'),
});

export const deliveryOrderApprovalSchema = z.object({
    // New field name
    deliveryAddresses: z.array(orderItemSchema).min(1, 'Orders array must contain at least one item').optional(),
    // Keep old name for backward compat
    invoiceDeliveries: z.array(orderItemSchema).min(1, 'Orders array must contain at least one item').optional(),
}).refine(data => data.deliveryAddresses || data.invoiceDeliveries, {
    message: 'Either deliveryAddresses or invoiceDeliveries must be provided',
});

export type DeliveryOrderApprovalInput = z.infer<typeof deliveryOrderApprovalSchema>;

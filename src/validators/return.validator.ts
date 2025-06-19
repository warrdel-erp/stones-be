import { z } from "zod";

export const createReturnSchema = z.object({
    productIds: z.array(z.number()).min(1, "At least one product must be selected for return"),
    invoiceId: z.number().positive("Invoice ID must be a positive number")
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>; 
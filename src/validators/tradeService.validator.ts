import { z } from "zod";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";

export const createTradeServiceSchema = z.object({
    referenceType: z.enum(Object.values(TRADE_SERVICE_REFERENCE_TYPES) as [string, ...string[]], {
        required_error: "Reference type is required",
        invalid_type_error: `Reference type must be one of: ${Object.values(TRADE_SERVICE_REFERENCE_TYPES).join(', ')}`,
    }),
    referenceId: z.number({
        required_error: "Reference ID is required",
        invalid_type_error: "Reference ID must be a number",
    }).int("Reference ID must be an integer").positive("Reference ID must be positive"),
    quantity: z.number({
        invalid_type_error: "Quantity must be a number",
    }).int("Quantity must be an integer").positive("Quantity must be positive").optional().default(1),
    price: z.number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
    }).positive("Price must be positive"),
    chargeType: z.enum(["fixed", "variable"]).optional().default("variable"),
    serviceId: z.number({
        required_error: "Service ID is required",
        invalid_type_error: "Service ID must be a number",
    }).int("Service ID must be an integer").positive("Service ID must be positive"),
    applyToCustomer: z.boolean().optional(),
});

export const updateTradeServiceSchema = z.object({
    quantity: z.number({
        invalid_type_error: "Quantity must be a number",
    }).int("Quantity must be an integer").positive("Quantity must be positive").optional(),
    price: z.number({
        invalid_type_error: "Price must be a number",
    }).positive("Price must be positive").optional(),
    chargeType: z.enum(["fixed", "variable"]).optional(),
    applyToCustomer: z.boolean().optional(),
});

export type CreateTradeServiceInput = z.infer<typeof createTradeServiceSchema>;
export type UpdateTradeServiceInput = z.infer<typeof updateTradeServiceSchema>; 
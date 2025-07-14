import { z } from "zod";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";

export const createTradeServiceSchema = z.object({
    referenceType: z.enum([
        TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER,
        TRADE_SERVICE_REFERENCE_TYPES.PURCHASE_ORDER,
    ], {
        required_error: "Reference type is required",
        invalid_type_error: "Reference type must be loadingOrder or purchaseOrder",
    }),
    referenceId: z.number({
        required_error: "Reference ID is required",
        invalid_type_error: "Reference ID must be a number",
    }).int("Reference ID must be an integer").positive("Reference ID must be positive"),
    quantity: z.number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a number",
    }).int("Quantity must be an integer").positive("Quantity must be positive"),
    price: z.number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
    }).positive("Price must be positive"),
    serviceId: z.number({
        required_error: "Service ID is required",
        invalid_type_error: "Service ID must be a number",
    }).int("Service ID must be an integer").positive("Service ID must be positive"),
});

export type CreateTradeServiceInput = z.infer<typeof createTradeServiceSchema>; 
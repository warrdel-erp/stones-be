import { z } from "zod";
import { DELIVERY_TYPES } from "../constants/tableTypes";

export const createSalesOrderSchema = z.object({
  customerId: z.number({ required_error: "Customer is required" }).int(),
  deliveryType: z.enum(Object.values(DELIVERY_TYPES) as [string, ...string[]], {
    required_error: "Delivery Type is required",
  }),
  shippingAddressId: z.number({ required_error: "Delivery Location is required" }).int(),
  holdId: z.number().int().optional().nullable(),
  soDate: z.string().optional(),
  customerPo: z.string().optional().nullable(),
  customerPoDate: z.string().optional().nullable(),
  expDeliveryDate: z.string().optional().nullable(),
  deliveryNotes: z.string().optional().nullable(),
  paymentTermId: z.number().int().optional().nullable(),
  internalNote: z.string().optional().nullable(),
  printableNote: z.string().optional().nullable(),
  discountPercentage: z.coerce.number().min(0).max(100).transform((v) => Math.round(v * 100) / 100).optional().nullable(),

  products: z.array(
    z.object({
      inventoryProductId: z.number().int(),
      unitPrice: z.coerce.number().positive(),
    })
  ).optional().default([]),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;

export const updateSalesOrderDiscountSchema = z.object({
  discountPercentage: z.coerce
    .number({ required_error: "Discount percentage is required" })
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100")
    .transform((v) => Math.round(v * 100) / 100),
});

export type UpdateSalesOrderDiscountInput = z.infer<typeof updateSalesOrderDiscountSchema>;

export const updateSalesOrderSchema = z.object({
  deliveryType: z.enum(Object.values(DELIVERY_TYPES) as [string, ...string[]]).optional(),
  shippingAddressId: z.number().int().optional().nullable(),
  customerPo: z.string().optional().nullable(),
  customerPoDate: z.string().optional().nullable(),
  expDeliveryDate: z.string().optional().nullable(),
  paymentTermId: z.number().int().optional().nullable(),
  deliveryNotes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  internalNote: z.string().optional().nullable(),
});

export type UpdateSalesOrderInput = z.infer<typeof updateSalesOrderSchema>;


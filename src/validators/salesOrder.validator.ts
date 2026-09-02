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
  products: z.array(
    z.object({
      inventoryProductId: z.number().int(),
      unitPrice: z.coerce.number().positive(),
      taxApplied: z.boolean().optional(),
    })
  ).optional().default([]),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;

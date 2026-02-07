import { z } from "zod";

export const customerBulkUploadSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  primaryPhoneNumber: z.string({ required_error: "primaryPhoneNumber is required for bulk upload" }).min(1, "primaryPhoneNumber cannot be empty"),
  contactName: z.string().optional().nullable(),
  printName: z.string().optional().nullable(),
  secondaryPhoneNumber: z.string().optional().nullable(),
  landlineNumber: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  priceLevel: z.string().optional().nullable(),
  taxExempt: z.boolean().optional().nullable(),
  salesTaxId: z.number().int().optional().nullable(),
  paymentTermId: z.number().int().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  scopeId: z.number().int().optional().nullable(),
  // Shipping address fields
  shippingAddress: z.string().optional().nullable(),
  shippingAddressLine: z.string().optional().nullable(),
  shippingUnit: z.string().optional().nullable(),
  shippingLat: z.number().optional().nullable(),
  shippingLong: z.number().optional().nullable(),
  shippingContactName: z.string().optional().nullable(),
  shippingContactEmail: z.string().optional().nullable(),
  shippingContactNumber: z.string().optional().nullable(),
  shippingCountryId: z.number().int().optional().nullable(),
  // Remit address fields
  remitAddress: z.string().optional().nullable(),
  remitAddressLine: z.string().optional().nullable(),
  remitUnit: z.string().optional().nullable(),
  remitLat: z.number().optional().nullable(),
  remitLong: z.number().optional().nullable(),
  remitContactName: z.string().optional().nullable(),
  remitContactEmail: z.string().optional().nullable(),
  remitContactNumber: z.string().optional().nullable(),
  remitCountryId: z.number().int().optional().nullable(),
});

export type CustomerBulkUploadInput = z.infer<typeof customerBulkUploadSchema>;

import { z } from "zod";

export const customerBulkUploadSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
  email: z.string({ required_error: "Email is required" }).trim().min(1, "Email cannot be empty").email("Invalid email format"),
  primaryPhoneNumber: z.string({ required_error: "primaryPhoneNumber is required for bulk upload" }).trim().min(1, "primaryPhoneNumber cannot be empty"),
  contactName: z.string().trim().optional().nullable(),
  printName: z.string().trim().optional().nullable(),
  secondaryPhoneNumber: z.string().trim().optional().nullable(),
  landlineNumber: z.string().trim().optional().nullable(),
  fax: z.string().trim().optional().nullable(),
  accEmail: z.preprocess((val) => (val === "" ? null : val), z.string().trim().email("Invalid accounting email format").optional().nullable()),
  type: z.string().optional().nullable(),
  priceLevel: z.string().optional().nullable(),
  taxExempt: z.boolean().optional().nullable(),
  salesTax: z.string().optional().nullable(),
  paymentTermId: z.number().int().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  deliveryNotes: z.string().optional().nullable(),
  customerCode: z.string(),
  status: z.enum(["active", "inactive"]).default("active"),
  scopeId: z.number().int().optional().nullable(),
  // Shipping address fields
  shippingAddress: z.string().optional().nullable(),
  shippingAddressLine: z.string().optional().nullable(),
  shippingLat: z.number().optional().nullable(),
  shippingLong: z.number().optional().nullable(),
  shippingContactName: z.string().optional().nullable(),
  shippingContactEmail: z.string().optional().nullable(),
  shippingContactNumber: z.string().optional().nullable(),
  shippingCountryId: z.number().int().optional().nullable(),
  // Remit address fields
  remitAddress: z.string().optional().nullable(),
  remitAddressLine: z.string().optional().nullable(),
  remitLat: z.number().optional().nullable(),
  remitLong: z.number().optional().nullable(),
  remitContactName: z.string().optional().nullable(),
  remitContactEmail: z.string().optional().nullable(),
  remitContactNumber: z.string().optional().nullable(),
  remitCountryId: z.number().int().optional().nullable(),
});

export type CustomerBulkUploadInput = z.infer<typeof customerBulkUploadSchema>;

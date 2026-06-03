import { z } from "zod";

export const vendorBulkUploadSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
  printName: z.string().optional().nullable(),
  email: z.union([z.string().email("Invalid email format"), z.literal("")]).optional().nullable(),
  primaryPhoneNo: z.string().optional().nullable(),
  type: z.enum(["FREIGHT", "SUPPLIER"], { required_error: "Type is required (FREIGHT or SUPPLIER)" }),
  contactName: z.string().optional().nullable(),
  secondaryPhoneNo: z.string().optional().nullable(),
  landlineNo: z.string().optional().nullable(),
  accountingEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  vendorScope: z.string().optional().nullable(),
  paymentTerms: z.number().int().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  currency: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  // Remit address
  remitAddress: z.string().optional().nullable(),
  remitSuite: z.string().optional().nullable(),
  remitCity: z.string().optional().nullable(),
  remitState: z.string().optional().nullable(),
  remitZip: z.string().optional().nullable(),
  remitCountry: z.string().optional().nullable(),
  // Shipping address
  shippingAddress: z.string().optional().nullable(),
  shippingSuite: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
  shippingState: z.string().optional().nullable(),
  shippingZip: z.string().optional().nullable(),
  shippingCountry: z.string().optional().nullable(),
});

export type VendorBulkUploadInput = z.infer<typeof vendorBulkUploadSchema>;

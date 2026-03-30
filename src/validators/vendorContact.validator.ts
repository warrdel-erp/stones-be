import { z } from "zod";

export const vendorContactSchema = z.object({
  phone: z.string({ required_error: "Phone is required" }).min(10, "Phone number must be at least 10 digits").regex(/^\+?[1-9]\d{1,14}$|^[\d\s\-()]{10,20}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email format"),
  isPrimary: z.boolean().default(false),
  vendorId: z.number({ required_error: "Vendor ID is required" }),
});

export const updateVendorContactSchema = vendorContactSchema.partial().omit({ vendorId: true });

export type VendorContactInput = z.infer<typeof vendorContactSchema>;
export type UpdateVendorContactInput = z.infer<typeof updateVendorContactSchema>;

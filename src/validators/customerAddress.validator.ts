import { z } from "zod";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";

export const customerAddressSchema = z.object({
  address: z.string({ required_error: "Address is required" }).min(1, "Address cannot be empty"),
  addressLine: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email format").optional().nullable(),
  contactNumber: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  long: z.number().optional().nullable(),
  addressType: z.enum(Object.values(CUSTOMER_ADDRESS_TYPES) as [string, ...string[]], {
    required_error: "addressType is required",
  }),
  customerId: z.number({ required_error: "customerId is required" }).int(),
});

export const updateCustomerAddressSchema = customerAddressSchema.partial().omit({
  customerId: true, // we don't want to change customerId for an address
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>;

import { z } from "zod";

export const wiringInstructionSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
  address: z.string({ required_error: "Address is required" }).min(1, "Address cannot be empty"),
  swiftCode: z.string({ required_error: "SWIFT Code is required" }).min(1, "SWIFT Code cannot be empty"),
  accNo: z.string({ required_error: "Account Number is required" }).min(1, "Account Number cannot be empty"),
  vendorId: z.number({ required_error: "Vendor ID is required" }),
});

export const updateWiringInstructionSchema = wiringInstructionSchema.partial().omit({ vendorId: true });

export type WiringInstructionInput = z.infer<typeof wiringInstructionSchema>;
export type UpdateWiringInstructionInput = z.infer<typeof updateWiringInstructionSchema>;

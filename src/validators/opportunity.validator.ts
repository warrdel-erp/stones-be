import { z } from "zod";

export const createOpportunitySchema = z.object({
  customerId: z.number({
    required_error: "Customer is required",
    invalid_type_error: "Customer ID must be a number",
  }),
  opportunityName: z
    .string({
      required_error: "Opportunity Name is required",
      invalid_type_error: "Opportunity Name must be a string",
    })
    .min(1, "Opportunity Name cannot be empty"),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
  endCustomerName: z.string().optional().nullable(),
  opportunityType: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  expectedDecisionDate: z.string().optional().nullable(),
  leadSource: z.string().optional().nullable(),

  salespersonId: z.number().optional().nullable(),
  team: z.string().optional().nullable(),
  referralBy: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  followUpAction: z.string().optional().nullable(),
  assignedToId: z.number().optional().nullable(),

  notes: z.string().optional().nullable(),
  status: z.string().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const addOpportunityRequirementSchema = z.object({
  productId: z.number({
    required_error: "Product is required",
    invalid_type_error: "Product ID must be a number",
  }),
  unitType: z.enum(["slabs", "sqft"], {
    required_error: "Unit Type is required",
    invalid_type_error: 'Unit Type must be either "slabs" or "sqft"',
  }),
  requiredCount: z
    .number({
      required_error: "Required Count is required",
      invalid_type_error: "Required Count must be a number",
    })
    .positive("Required Count must be positive"),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type AddOpportunityRequirementInput = z.infer<typeof addOpportunityRequirementSchema>;

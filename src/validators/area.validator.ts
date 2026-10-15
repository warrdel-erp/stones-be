import { z } from "zod";

export const createAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  warehouseId: z.number().int("Warehouse ID must be an integer").optional(),
});

export const updateAreaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

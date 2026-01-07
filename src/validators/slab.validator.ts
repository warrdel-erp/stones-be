import { z } from "zod";

const slabPieceSchema = z.object({
  receivingLength: z.number({
    required_error: "receivingLength is required",
    invalid_type_error: "receivingLength must be a number",
  }).positive("receivingLength must be greater than 0"),
  receivingWidth: z.number({
    required_error: "receivingWidth is required",
    invalid_type_error: "receivingWidth must be a number",
  }).positive("receivingWidth must be greater than 0"),
  slabNumber: z.number({
    required_error: "slabNumber is required",
    invalid_type_error: "slabNumber must be a number",
  }).int("slabNumber must be an integer").positive("slabNumber must be positive"),
});

export const splitSlabSchema = z.object({
  slabs: z.array(slabPieceSchema, {
    required_error: "slabs array is required",
    invalid_type_error: "slabs must be an array",
  })
    .min(2, "At least 2 pieces are required to split a slab"),
});

export type SplitSlabInput = z.infer<typeof splitSlabSchema>;


import { z } from "zod";

export const paginationValidation  = z.object({
    limit: z.coerce.number().min(1, "pagination parameter 'limit' must be number and equal or greater then 1"),
    page: z.coerce.number().min(1, "pagination parameter 'page' must be number and equal or greater then 1")
})
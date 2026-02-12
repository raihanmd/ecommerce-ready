import { z } from "zod";

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category_id: z.string().optional(),
  search: z.string().optional(),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

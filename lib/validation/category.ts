import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  iconUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

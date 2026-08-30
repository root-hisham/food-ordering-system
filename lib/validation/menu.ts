import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isVeg: z.coerce.boolean(),
});

export const updateMenuItemSchema = createMenuItemSchema;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
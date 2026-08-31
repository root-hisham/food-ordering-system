"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createCategorySchema } from "@/lib/validation/category";
import { createCategory, deleteCategory } from "@/services/category.service";

export type CategoryState = { error?: string; success?: boolean };

export async function createCategoryAction(
  _prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireRole(["admin"]);

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    iconUrl: formData.get("iconUrl") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createCategory(parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireRole(["admin"]);
  await deleteCategory(categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

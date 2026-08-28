"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { createCategorySchema } from "@/lib/validation/menu";
import { createCategory, deleteCategory } from "@/services/menu.service";

export type CategoryState = { error?: string; success?: boolean };

export async function createCategoryAction(
  _prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  if (!stallId) return { error: "No stall linked to this account." };

  const parsed = createCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createCategory(stallId, parsed.data.name);
  if (result.error) return { error: result.error };

  revalidatePath("/owner/categories");
  revalidatePath("/owner/menu");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireRole(["stall_owner"]);
  await deleteCategory(categoryId);
  revalidatePath("/owner/categories");
  revalidatePath("/owner/menu");
}
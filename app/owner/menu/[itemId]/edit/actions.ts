"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { updateMenuItemSchema } from "@/lib/validation/menu";
import { updateMenuItem } from "@/services/menu.service";

export type EditMenuItemState = { error?: string; success?: boolean };

export async function updateMenuItemAction(
  itemId: string,
  _prevState: EditMenuItemState,
  formData: FormData
): Promise<EditMenuItemState> {
  await requireRole(["stall_owner"]);

  const parsed = updateMenuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    categoryId: formData.get("categoryId") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    isVeg: formData.get("isVeg") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await updateMenuItem(itemId, parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/owner/menu");
  return { success: true };
}
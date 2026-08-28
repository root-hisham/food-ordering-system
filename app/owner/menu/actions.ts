"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { createMenuItemSchema } from "@/lib/validation/menu";
import { createMenuItem, toggleMenuItemAvailability, deleteMenuItem } from "@/services/menu.service";

export type MenuItemState = { error?: string; success?: boolean };

export async function createMenuItemAction(
  _prevState: MenuItemState,
  formData: FormData
): Promise<MenuItemState> {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  if (!stallId) return { error: "No stall linked to this account." };

  const parsed = createMenuItemSchema.safeParse({
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

  const result = await createMenuItem(stallId, parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/owner/menu");
  return { success: true };
}

export async function toggleMenuItemAvailabilityAction(itemId: string, isAvailable: boolean) {
  await requireRole(["stall_owner"]);
  await toggleMenuItemAvailability(itemId, !isAvailable);
  revalidatePath("/owner/menu");
}

export async function deleteMenuItemAction(itemId: string) {
  await requireRole(["stall_owner"]);
  await deleteMenuItem(itemId);
  revalidatePath("/owner/menu");
}
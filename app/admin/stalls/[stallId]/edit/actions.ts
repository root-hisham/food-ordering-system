"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { updateStallSchema } from "@/lib/validation/stall";
import { updateStall } from "@/services/stall.service";

export type EditStallState = { error?: string; success?: boolean };

export async function updateStallAction(
  stallId: string,
  _prevState: EditStallState,
  formData: FormData
): Promise<EditStallState> {
  await requireRole(["admin"]);

  const parsed = updateStallSchema.safeParse({
    stallName: formData.get("stallName"),
    category: formData.get("category"),
    categoryId: formData.get("categoryId") || undefined,
    description: formData.get("description") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await updateStall(stallId, parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/stalls");
  return { success: true };
}
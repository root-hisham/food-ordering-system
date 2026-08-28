"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createStallSchema } from "@/lib/validation/stall";
import { createStallWithOwner, setStallStatus } from "@/services/stall.service";

export type CreateStallState = { error?: string; success?: boolean };

export async function createStallAction(
  _prevState: CreateStallState,
  formData: FormData
): Promise<CreateStallState> {
  const admin = await requireRole(["admin"]);

  const parsed = createStallSchema.safeParse({
    stallName: formData.get("stallName"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    ownerName: formData.get("ownerName"),
    ownerMobile: formData.get("ownerMobile"),
    ownerEmail: formData.get("ownerEmail"),
    ownerPassword: formData.get("ownerPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createStallWithOwner(parsed.data, admin.id);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/stalls");
  return { success: true };
}

export async function toggleStallStatusAction(stallId: string, currentStatus: "active" | "inactive") {
  await requireRole(["admin"]);
  const next = currentStatus === "active" ? "inactive" : "active";
  await setStallStatus(stallId, next);
  revalidatePath("/admin/stalls");
}
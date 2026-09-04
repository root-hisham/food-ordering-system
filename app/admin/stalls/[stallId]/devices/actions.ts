"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { setStallDeviceLimit, revokeOwnerSession } from "@/services/owner-session.service";

export type DeviceLimitState = { error?: string; success?: boolean };

export async function setDeviceLimitAction(
  stallId: string,
  _prevState: DeviceLimitState,
  formData: FormData
): Promise<DeviceLimitState> {
  await requireRole(["admin"]);

  const raw = formData.get("deviceLimit");
  const limit = Number(raw);

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    return { error: "Enter a whole number between 1 and 20." };
  }

  const result = await setStallDeviceLimit(stallId, limit);
  if (result.error) return { error: result.error };

  revalidatePath(`/admin/stalls/${stallId}/devices`);
  return { success: true };
}

export async function revokeSessionAction(stallId: string, sessionId: string) {
  await requireRole(["admin"]);
  await revokeOwnerSession(sessionId);
  revalidatePath(`/admin/stalls/${stallId}/devices`);
}
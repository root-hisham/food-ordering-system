"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { setStallAvailability } from "@/services/stall.service";
import type { StallAvailability } from "@/types/stall";

export async function setStallAvailabilityAction(availability: StallAvailability) {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  if (!stallId) return { error: "No stall linked to this account." };

  const result = await setStallAvailability(stallId, availability);
  if (result.error) return { error: result.error };

  // Revalidate owner section (toggle lives in the layout) and the
  // customer-facing pages so the badge/ordering block updates too.
  revalidatePath("/owner", "layout");
  revalidatePath(`/stall/${stallId}`);
  revalidatePath("/stalls");
  return { success: true };
}

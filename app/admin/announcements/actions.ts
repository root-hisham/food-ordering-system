"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createAnnouncementSchema } from "@/lib/validation/announcement";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncementActive } from "@/services/announcement.service";

export type AnnouncementState = { error?: string; success?: boolean };

export async function createAnnouncementAction(
  _prevState: AnnouncementState,
  formData: FormData
): Promise<AnnouncementState> {
  await requireRole(["admin"]);

  const parsed = createAnnouncementSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createAnnouncement(parsed.data);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  return { success: true };
}

export async function toggleAnnouncementAction(id: string, currentlyActive: boolean) {
  await requireRole(["admin"]);
  await toggleAnnouncementActive(id, !currentlyActive);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncementAction(id: string) {
  await requireRole(["admin"]);
  await deleteAnnouncement(id);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

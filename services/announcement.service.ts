import { createClient } from "@/lib/supabase/server";

export async function listActiveAnnouncements() {
  const supabase = createClient();

  const { data } = await supabase
    .from("announcements")
    .select(
      "id, image_url, title, subtitle, link_url, is_active, sort_order"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function listAnnouncementsForAdmin() {
  const supabase = createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, image_url, title, subtitle, link_url, is_active, sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export interface AnnouncementInput {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  sortOrder: number;
}

export async function createAnnouncement(input: AnnouncementInput) {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").insert({
    image_url: input.imageUrl,
    title: input.title || null,
    subtitle: input.subtitle || null,
    link_url: input.linkUrl || null,
    sort_order: input.sortOrder,
  });
  return { error: error?.message };
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").update({ is_active: isActive }).eq("id", id);
  return { error: error?.message };
}

export async function deleteAnnouncement(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  return { error: error?.message };
}

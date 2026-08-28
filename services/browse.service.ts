import { createClient } from "@/lib/supabase/server";

export async function listActiveStalls(search?: string) {
  const supabase = createClient();
  let query = supabase
    .from("stalls")
    .select("id, name, description, category, logo_url, status")
    .eq("status", "active")
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data } = await query;
  return data ?? [];
}

export async function getStallWithMenu(stallId: string) {
  const supabase = createClient();

  const { data: stall } = await supabase
    .from("stalls")
    .select("id, name, description, category, logo_url, status")
    .eq("id", stallId)
    .single();

  if (!stall) return null;

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, name, sort_order")
    .eq("stall_id", stallId)
    .order("sort_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, name, description, price, image_url, is_veg, is_available, category_id")
    .eq("stall_id", stallId);

  return { stall, categories: categories ?? [], items: items ?? [] };
}
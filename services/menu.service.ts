import { createClient } from "@/lib/supabase/server";

export async function listCategories(stallId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("menu_categories")
    .select("id, name, sort_order")
    .eq("stall_id", stallId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function createCategory(stallId: string, name: string, sortOrder = 0) {
  const supabase = createClient();
  const { error } = await supabase
    .from("menu_categories")
    .insert({ stall_id: stallId, name, sort_order: sortOrder });
  return { error: error?.message };
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId);
  return { error: error?.message };
}

export async function listMenuItems(stallId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("menu_items")
    .select(
      "id, name, description, price, image_url, is_veg, is_available, category_id, menu_categories(name)"
    )
    .eq("stall_id", stallId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((item: any) => ({
    ...item,
    categoryName: item.menu_categories?.name ?? "Uncategorized",
  }));
}

export interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isVeg: boolean;
}

export async function createMenuItem(stallId: string, input: MenuItemInput) {
  const supabase = createClient();
  const { error } = await supabase.from("menu_items").insert({
    stall_id: stallId,
    category_id: input.categoryId || null,
    name: input.name,
    description: input.description || null,
    price: input.price,
    image_url: input.imageUrl || null,
    is_veg: input.isVeg,
    is_available: true,
  });
  return { error: error?.message };
}

export async function toggleMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
  return { error: error?.message };
}

export async function deleteMenuItem(itemId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
  return { error: error?.message };
}
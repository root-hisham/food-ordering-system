import { createClient } from "@/lib/supabase/server";

export async function listCategories() {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, icon_url, sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export interface CategoryInput {
  name: string;
  iconUrl?: string;
  sortOrder: number;
}

export async function createCategory(input: CategoryInput) {
  const supabase = createClient();
  const { error } = await supabase.from("categories").insert({
    name: input.name,
    icon_url: input.iconUrl || null,
    sort_order: input.sortOrder,
  });
  return { error: error?.message };
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      icon_url: input.iconUrl || null,
      sort_order: input.sortOrder,
    })
    .eq("id", categoryId);
  return { error: error?.message };
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  return { error: error?.message };
}

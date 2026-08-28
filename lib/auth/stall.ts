import { createClient } from "@/lib/supabase/server";

/**
 * Looks up the stall a stall_owner is linked to. Every owner-facing
 * page needs this before it can query anything scoped to "their"
 * stall.
 */
export async function getOwnerStallId(ownerId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("stall_owners")
    .select("stall_id")
    .eq("id", ownerId)
    .single();
  return data?.stall_id ?? null;
}
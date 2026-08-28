import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { CreateStallInput } from "@/lib/validation/stall";

/**
 * Creates a stall AND its owner's login account together — this is
 * the core "admin provisions a stall owner" business rule (owners
 * never self-register). Uses the service-role client because
 * creating an auth user via the Admin API, and inserting the
 * resulting profile row, both fall outside what RLS allows any
 * authenticated user (including admins) to do directly.
 */
export async function createStallWithOwner(input: CreateStallInput, createdBy: string) {
  const admin = createServiceRoleClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.ownerEmail,
    password: input.ownerPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create owner account." };
  }

  const ownerId = created.user.id;

  const { data: stall, error: stallError } = await admin
    .from("stalls")
    .insert({
      name: input.stallName,
      category: input.category,
      description: input.description || null,
      logo_url: input.logoUrl || null,
      status: "active",
      created_by: createdBy,
    })
    .select()
    .single();

  if (stallError || !stall) {
    await admin.auth.admin.deleteUser(ownerId);
    return { error: stallError?.message ?? "Could not create stall." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: ownerId,
    role: "stall_owner",
    full_name: input.ownerName,
    mobile_number: input.ownerMobile,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(ownerId);
    await admin.from("stalls").delete().eq("id", stall.id);
    return { error: "Could not create owner profile. Please try again." };
  }

  const { error: ownerLinkError } = await admin
    .from("stall_owners")
    .insert({ id: ownerId, stall_id: stall.id });

  if (ownerLinkError) {
    await admin.auth.admin.deleteUser(ownerId);
    await admin.from("stalls").delete().eq("id", stall.id);
    return { error: "Could not link owner to stall. Please try again." };
  }

  return { stall };
}

/**
 * Uses the request-scoped (authenticated) client, not service role —
 * RLS's "admin manages stalls" policy already permits this read for
 * a logged-in admin, so there's no need to bypass it.
 */
export async function listStallsWithOwners() {
  const supabase = createClient();

  const { data: stalls, error } = await supabase
    .from("stalls")
    .select("id, name, category, description, logo_url, status, created_at")
    .order("created_at", { ascending: false });

  if (error || !stalls) return [];

  const { data: owners } = await supabase
    .from("stall_owners")
    .select("id, stall_id, profiles(full_name, mobile_number)");

  const ownerByStall = new Map((owners ?? []).map((o: any) => [o.stall_id, o.profiles]));

  return stalls.map((s) => ({ ...s, owner: ownerByStall.get(s.id) ?? null }));
}

export async function setStallStatus(stallId: string, status: "active" | "inactive") {
  const supabase = createClient();
  const { error } = await supabase.from("stalls").update({ status }).eq("id", stallId);
  return { error: error?.message };
}
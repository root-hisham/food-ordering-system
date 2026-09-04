import { createClient } from "@/lib/supabase/server";

export interface OwnerDeviceSession {
  id: string;
  device_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Admin-facing read — uses the normal request-scoped client, not the
 * service-role key, so this relies entirely on RLS's "admin manages
 * all owner sessions" policy. Only a logged-in admin can ever get a
 * result back from this.
 */
export async function listActiveOwnerSessions(ownerId: string): Promise<OwnerDeviceSession[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("owner_sessions")
    .select("id, device_label, ip_address, user_agent, created_at")
    .eq("owner_id", ownerId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/** Admin removes one specific device. RLS is what actually enforces
 *  that only an admin can do this — this call would no-op for anyone
 *  else even if it were somehow reached. */
export async function revokeOwnerSession(sessionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("owner_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", sessionId);
  return { error: error?.message };
}

export async function setStallDeviceLimit(stallId: string, limit: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("stalls")
    .update({ device_limit: limit })
    .eq("id", stallId);
  return { error: error?.message };
}
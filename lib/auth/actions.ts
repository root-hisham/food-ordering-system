"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { OWNER_SESSION_COOKIE, revokeOwnerDeviceSessionByToken } from "@/lib/auth/device-session";

/**
 * Universal sign-out used by every role's SignOutButton. For stall
 * owners this also frees up their device slot immediately — without
 * this, clicking "Sign out" wouldn't reduce their active-device
 * count until the row expired some other way, effectively wasting a
 * slot every time an owner signs out normally.
 */
export async function signOutAction() {
  const token = cookies().get(OWNER_SESSION_COOKIE)?.value;
  if (token) {
    await revokeOwnerDeviceSessionByToken(token);
    cookies().set(OWNER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  }

  const supabase = createClient();
  await supabase.auth.signOut();
}
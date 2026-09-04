import { headers, cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Cookie holding the opaque per-device session token for stall
 * owners. Deliberately separate from Supabase's own auth cookies —
 * this is what lets us enforce a hard device limit and let an admin
 * kick one specific device, neither of which Supabase Auth's client
 * libraries expose a supported way to do.
 *
 * httpOnly so it can never be read or forged from client-side JS —
 * only server code (login, middleware, sign-out) ever touches it.
 */
export const OWNER_SESSION_COOKIE = "od_session";
const OWNER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Turns a raw User-Agent string into something a human admin can
 * recognise at a glance ("Chrome on Windows") — approximate on
 * purpose, this is a display label, not a fingerprint.
 */
export function parseDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
    ? "Opera"
    : /Chrome\//.test(userAgent)
    ? "Chrome"
    : /Firefox\//.test(userAgent)
    ? "Firefox"
    : /Safari\//.test(userAgent)
    ? "Safari"
    : "Browser";

  const os = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iOS/.test(userAgent)
    ? "iOS"
    : /Windows/.test(userAgent)
    ? "Windows"
    : /Mac OS X/.test(userAgent)
    ? "macOS"
    : /Linux/.test(userAgent)
    ? "Linux"
    : "";

  return os ? `${browser} on ${os}` : browser;
}

function getRequestMeta() {
  const h = headers();
  const userAgent = h.get("user-agent");
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { userAgent, ip };
}

export type CreateOwnerSessionResult =
  | { error: string; token?: undefined }
  | { token: string; error?: undefined };

/**
 * Called right after a stall_owner's password is verified. Enforces
 * the per-stall device_limit BEFORE the new device is allowed to
 * stay signed in — the caller is expected to sign the user back out
 * again (supabase.auth.signOut()) if this returns an error, so a
 * rejected device never ends up with a live Supabase session either.
 *
 * Uses the service-role key on purpose: RLS intentionally has no
 * insert policy for stall_owner on owner_sessions, so this can only
 * ever be created from trusted server code, never forged client-side.
 */
export async function createOwnerDeviceSession(
  ownerId: string,
  stallId: string
): Promise<CreateOwnerSessionResult> {
  const admin = createServiceRoleClient();

  const { data: stall } = await admin
    .from("stalls")
    .select("device_limit")
    .eq("id", stallId)
    .single();

  const deviceLimit = stall?.device_limit ?? 2;

  const { count } = await admin
    .from("owner_sessions")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .is("revoked_at", null);

  if ((count ?? 0) >= deviceLimit) {
    return {
      error: `Device limit reached (${deviceLimit} active). Ask your admin to remove a device, or sign out from another device first.`,
    };
  }

  const { userAgent, ip } = getRequestMeta();
  const token = generateSessionToken();

  const { error } = await admin.from("owner_sessions").insert({
    owner_id: ownerId,
    stall_id: stallId,
    session_token: token,
    device_label: parseDeviceLabel(userAgent),
    user_agent: userAgent,
    ip_address: ip,
  });

  if (error) {
    return { error: "Could not start a device session. Please try again." };
  }

  cookies().set(OWNER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_SESSION_MAX_AGE,
  });

  return { token };
}

/** Revokes the session tied to the given token — used on manual sign-out. */
export async function revokeOwnerDeviceSessionByToken(token: string): Promise<void> {
  const admin = createServiceRoleClient();
  await admin
    .from("owner_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("session_token", token)
    .is("revoked_at", null);
}
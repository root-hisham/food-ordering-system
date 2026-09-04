import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}

const OWNER_SESSION_COOKIE = "od_session";

/**
 * Edge-safe device-session check for stall owners. Runs on every
 * request under /owner — pages AND server actions alike, since both
 * are intercepted by this middleware before anything else executes —
 * so a device an admin has just removed loses access on its very
 * next request, not just on the next full page load. A request
 * carrying no valid device-session cookie at all (e.g. a session
 * that predates this feature) is treated the same way: rejected.
 *
 * Deliberately uses the service-role key directly rather than the
 * request's own cookie-bound client: RLS intentionally has no policy
 * letting a stall_owner read or extend their own session's validity,
 * so this check can't be satisfied by anything the browser holds.
 */
export async function isOwnerDeviceSessionValid(
  request: NextRequest,
  ownerId: string
): Promise<boolean> {
  const token = request.cookies.get(OWNER_SESSION_COOKIE)?.value;
  if (!token) return false;

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data, error } = await admin
    .from("owner_sessions")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("session_token", token)
    .is("revoked_at", null)
    .maybeSingle();

  return !error && !!data;
}
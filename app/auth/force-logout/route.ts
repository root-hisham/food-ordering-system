import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OWNER_SESSION_COOKIE = "od_session";

/**
 * Landed on by middleware when a stall owner's device session is
 * missing or has been revoked (by an admin, or by the owner
 * themselves signing out elsewhere). A redirect from middleware
 * can't clear Supabase's own auth cookies, so this route handler
 * does the actual sign-out, then sends the device to /login with a
 * reason it can show the person.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const reason = request.nextUrl.searchParams.get("reason") ?? "signed_out";
  const url = new URL("/login", request.url);
  url.searchParams.set("notice", reason);

  const response = NextResponse.redirect(url);
  response.cookies.set(OWNER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
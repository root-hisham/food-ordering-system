import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function requiredRoleForPath(pathname: string): "admin" | "stall_owner" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/owner")) return "stall_owner";
  return null;
}

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);

  const requiredRole = requiredRoleForPath(request.nextUrl.pathname);
  if (!requiredRole) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== requiredRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|qr).*)"],
};
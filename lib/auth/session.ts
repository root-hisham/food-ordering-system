import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/user";

/**
 * Wrapped in React's cache() so that within a single request, calling this
 * from both the root layout (for the customerId used by chrome/cart/realtime)
 * and again from requireRole() in a nested owner/admin layout only hits
 * Supabase once instead of twice (2x auth.getUser() + 2x profiles query).
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, mobile_number, created_at")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
});

export async function requireRole(allowed: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    redirect("/login");
  }
  return profile;
}

export function homeRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "stall_owner":
      return "/owner";
    case "customer":
    default:
      return "/";
  }
}
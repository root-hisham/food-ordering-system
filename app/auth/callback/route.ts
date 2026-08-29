import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth exchange failed:", error?.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || "oauth_failed")}`
    );
  }

  // Service-role client for this part specifically: RLS intentionally
  // has no self-insert policy on profiles (normal registration also
  // goes through service role for the same reason). The role here is
  // hardcoded to "customer" in code, never taken from client input,
  // so this stays safe — Google sign-in can only ever create customers.
  const admin = createServiceRoleClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existingProfile) {
    const fullName =
      (data.user.user_metadata?.full_name as string | undefined) ||
      (data.user.user_metadata?.name as string | undefined) ||
      data.user.email ||
      "Customer";

    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      role: "customer",
      full_name: fullName,
      mobile_number: null,
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(profileError.message)}`);
    }

    const { error: customerError } = await admin.from("customers").insert({ id: data.user.id });
    if (customerError) {
      console.error("Customer row creation failed:", customerError.message);
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo || "/post-login"}`);
}
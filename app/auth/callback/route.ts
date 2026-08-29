import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Google sign-ins won't have a profile row yet on first login —
      // create one, always as a customer. Owner/admin accounts are
      // never self-service, Google or otherwise.
      const { data: existingProfile } = await supabase
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

        await supabase.from("profiles").insert({
          id: data.user.id,
          role: "customer",
          full_name: fullName,
          mobile_number: null,
        });
        await supabase.from("customers").insert({ id: data.user.id });
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo || "/post-login"}`);
}
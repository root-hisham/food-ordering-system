"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/auth";
import { mobileToSyntheticEmail } from "@/lib/auth/mobile-email";
import { createClient } from "@/lib/supabase/server";
import { createOwnerDeviceSession } from "@/lib/auth/device-session";

export type LoginState = { error?: string; success?: boolean };

const isMobileNumber = (value: string) => /^\d{10}$/.test(value.trim());

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { identifier, password } = parsed.data;
  const email = isMobileNumber(identifier)
    ? mobileToSyntheticEmail(identifier)
    : identifier.trim();

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Incorrect mobile number/email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Stall owners get an extra device-limited session layered on top
  // of the normal Supabase session — enforced here, BEFORE the login
  // is allowed to stick, not as an afterthought once they're already in.
  if (profile?.role === "stall_owner") {
    const { data: ownerRow } = await supabase
      .from("stall_owners")
      .select("stall_id")
      .eq("id", data.user.id)
      .single();

    if (ownerRow?.stall_id) {
      const result = await createOwnerDeviceSession(data.user.id, ownerRow.stall_id);
      if (result.error) {
        await supabase.auth.signOut();
        return { error: result.error };
      }
    }
  }

  // Redirect from inside the action (not via a client-side router.push after
  // reading state.success) so Next.js properly invalidates the router cache
  // before navigating. Doing this client-side instead can momentarily render
  // a stale pre-login RSC payload for the destination page and bounce back
  // to /login even though the sign-in actually succeeded.
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/post-login");
}
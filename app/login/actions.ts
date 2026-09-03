"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/auth";
import { mobileToSyntheticEmail } from "@/lib/auth/mobile-email";
import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect mobile number/email or password." };
  }

  // Redirect from inside the action (not via a client-side router.push after
  // reading state.success) so Next.js properly invalidates the router cache
  // before navigating. Doing this client-side instead can momentarily render
  // a stale pre-login RSC payload for the destination page and bounce back
  // to /login even though the sign-in actually succeeded.
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/post-login");
}
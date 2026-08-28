"use server";

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

  return { success: true };
}
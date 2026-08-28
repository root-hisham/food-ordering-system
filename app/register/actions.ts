"use server";

import { customerRegisterSchema } from "@/lib/validation/auth";
import { mobileToSyntheticEmail } from "@/lib/auth/mobile-email";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export type RegisterState = { error?: string; success?: boolean };

export async function registerCustomer(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = customerRegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    mobileNumber: formData.get("mobileNumber"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { fullName, mobileNumber, password } = parsed.data;
  const email = mobileToSyntheticEmail(mobileNumber);

  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("mobile_number", mobileNumber)
    .maybeSingle();

  if (existing) {
    return { error: "An account with this mobile number already exists." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create account." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "customer",
    full_name: fullName,
    mobile_number: mobileNumber,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Could not create account. Please try again." };
  }

  await admin.from("customers").insert({ id: created.user.id });

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: "Account created — please log in." };
  }

  return { success: true };
}
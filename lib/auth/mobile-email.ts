/**
 * Supabase Auth (password strategy) requires an email. Customers
 * register/log in with a mobile number instead, per the product
 * spec — so we deterministically map mobile -> a synthetic,
 * non-deliverable email used only internally by Supabase Auth.
 * Customers never see or need to know this email exists, and no
 * mail is ever sent to it. This keeps the door open to swap in
 * real OTP-based phone auth later without touching the schema.
 */
export function mobileToSyntheticEmail(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return `${digits}@customer.foodcourt.internal`;
}
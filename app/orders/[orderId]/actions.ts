"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function cancelMyOrderAction(orderId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Not logged in." };

  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", cancellation_reason: "Cancelled by customer" })
    .eq("id", orderId)
    .eq("customer_id", profile.id);

  revalidatePath(`/orders/${orderId}`);
  return { error: error?.message };
}
"use server";

import { getCurrentProfile } from "@/lib/auth/session";
import { getOrderForReorder } from "@/services/customer-order.service";

export async function getReorderDataAction(orderId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return getOrderForReorder(orderId, profile.id);
}
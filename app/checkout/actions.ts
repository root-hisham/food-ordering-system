"use server";

import { getCurrentProfile } from "@/lib/auth/session";
import { placeOrder, type PlaceOrderItem } from "@/services/customer-order.service";

export type CheckoutState = { error?: string; orderId?: string };

export async function placeOrderAction(
  stallId: string,
  items: PlaceOrderItem[]
): Promise<CheckoutState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "customer") {
    return { error: "Please log in to place an order." };
  }
  if (items.length === 0) {
    return { error: "Your cart is empty." };
  }

  const result = await placeOrder(profile.id, stallId, items);
  if (result.error || !result.order) {
    return { error: result.error ?? "Could not place order." };
  }

  return { orderId: result.order.id };
}
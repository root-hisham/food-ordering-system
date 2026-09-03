"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { placeOrderAsCustomer, type PlaceOrderItem } from "@/services/customer-order.service";
import { placeGuestOrder } from "@/services/guest-order.service";

export type CheckoutState = { error?: string; orderId?: string; guestToken?: string };

export async function placeOrderAction(
  stallId: string,
  items: PlaceOrderItem[],
  contactName: string,
  contactMobile: string,
  tableNumber: string
): Promise<CheckoutState> {
  if (items.length === 0) {
    return { error: "Your cart is empty." };
  }
  if (!contactName.trim() || !/^\d{10}$/.test(contactMobile.trim())) {
    return { error: "Enter a valid name and 10-digit mobile number." };
  }

  const profile = await getCurrentProfile();

  if (profile && profile.role === "customer") {
    const result = await placeOrderAsCustomer(profile.id, stallId, items, {
      contactName,
      contactMobile,
      tableNumber,
    });
    if (result.error || !result.order) {
      return { error: result.error ?? "Could not place order." };
    }
    return { orderId: result.order.id };
  }

  if (profile && profile.role !== "customer") {
    // A session exists but it's not a customer — almost always means the
    // browser's signed-in account changed since this page loaded (e.g. a
    // different tab logged in as an owner/admin). Cookies are shared across
    // every tab, so silently placing this as a guest order would hide it
    // from the customer's real account. Make them refresh and re-check.
    return {
      error:
        "Your session changed (maybe you signed in elsewhere in this browser). Please refresh the page and try again.",
    };
  }

  // No session at all — genuine guest checkout.
  const result = await placeGuestOrder(stallId, items, { contactName, contactMobile, tableNumber });
  if (result.error || !result.order) {
    return { error: result.error ?? "Could not place order." };
  }
  return { orderId: result.order.id, guestToken: result.order.guest_token };
}
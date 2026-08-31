"use server";

import { cancelGuestOrder } from "@/services/guest-order.service";

export async function cancelGuestOrderAction(token: string) {
  return cancelGuestOrder(token);
}
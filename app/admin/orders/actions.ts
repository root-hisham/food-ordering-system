"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { overrideOrderStatus } from "@/services/order.service";
import type { OrderStatus } from "@/types/order";

export async function overrideOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireRole(["admin"]);
  const result = await overrideOrderStatus(orderId, status);
  revalidatePath("/admin/orders");
  return result;
}
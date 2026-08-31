"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { advanceOrderStatus, cancelOrder, completeOrderWithCode } from "@/services/order.service";
import { createOrderNotification, type NotificationType } from "@/services/notification.service";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

const NOTIFICATION_FOR_STATUS: Partial<Record<OrderStatus, NotificationType>> = {
  accepted: "order_accepted",
  ready: "order_ready",
  completed: "order_completed",
  cancelled: "order_cancelled",
};

async function notifyCustomer(orderId: string, status: OrderStatus) {
  const type = NOTIFICATION_FOR_STATUS[status];
  if (!type) return;

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, customer_id")
    .eq("id", orderId)
    .single();

  // Guest orders have no customer_id — nothing to notify.
  if (order?.customer_id) {
    await createOrderNotification(order.customer_id, orderId, order.order_number, type);
  }
}

export async function advanceOrderStatusAction(orderId: string, nextStatus: OrderStatus) {
  await requireRole(["stall_owner"]);
  const result = await advanceOrderStatus(orderId, nextStatus);
  if (!result.error) await notifyCustomer(orderId, nextStatus);
  revalidatePath("/owner/orders");
  return result;
}

export async function completeOrderAction(orderId: string, code: string) {
  await requireRole(["stall_owner"]);
  const result = await completeOrderWithCode(orderId, code);
  if (!result.error) await notifyCustomer(orderId, "completed");
  revalidatePath("/owner/orders");
  return result;
}

export async function cancelOrderAction(orderId: string, reason: string) {
  await requireRole(["stall_owner"]);
  const result = await cancelOrder(orderId, reason);
  if (!result.error) await notifyCustomer(orderId, "cancelled");
  revalidatePath("/owner/orders");
  return result;
}
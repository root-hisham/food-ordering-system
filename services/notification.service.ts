import { createServiceRoleClient } from "@/lib/supabase/server";

export type NotificationType = "order_accepted" | "order_ready" | "order_completed" | "order_cancelled";

const MESSAGES: Record<NotificationType, (orderNumber: string) => { title: string; message: string }> = {
  order_accepted: (n) => ({ title: "Order Accepted", message: `Your order ${n} has been accepted.` }),
  order_ready: (n) => ({ title: "Food Ready! 🎉", message: `Your order ${n} is ready for pickup.` }),
  order_completed: (n) => ({ title: "Order Completed", message: `Your order ${n} has been picked up. Enjoy!` }),
  order_cancelled: (n) => ({ title: "Order Cancelled", message: `Your order ${n} has been cancelled.` }),
};

export async function createOrderNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  type: NotificationType
) {
  const admin = createServiceRoleClient();
  const { title, message } = MESSAGES[type](orderNumber);
  await admin.from("notifications").insert({ user_id: userId, order_id: orderId, type, title, message });
}
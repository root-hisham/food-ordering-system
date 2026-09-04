import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

export interface AdminOrderFilters {
  status?: OrderStatus;
  stallId?: string;
}

export async function listOrdersForAdmin(filters: AdminOrderFilters = {}) {
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, customer_id, contact_name, contact_mobile, stalls(name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.stallId) query = query.eq("stall_id", filters.stallId);

  const { data: orders, error } = await query;
  if (error || !orders) return [];

  // Registered customers who checked out before this field existed won't
  // have contact_name saved on the order — fall back to their profile name
  // for those older rows. Every order since guest checkout shipped
  // (registered or guest) always has contact_name, so this covers all
  // current traffic and only backfills historical gaps.
  const missingProfileIds = [
    ...new Set(
      orders.filter((o: any) => o.customer_id && !o.contact_name).map((o: any) => o.customer_id)
    ),
  ];
  const { data: profiles } =
    missingProfileIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", missingProfileIds)
      : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return orders.map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    stallName: o.stalls?.name ?? "—",
    customerName: o.contact_name ?? nameById.get(o.customer_id) ?? "—",
    customerMobile: o.contact_mobile ?? "—",
    status: o.status as OrderStatus,
    total: Number(o.total),
    createdAt: o.created_at,
  }));
}

export async function overrideOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  return { error: error?.message };
}

// ============================================================
// STALL OWNER — order management for their own stall
// ============================================================

export interface StallOrderItem {
  item_name: string;
  quantity: number;
  unit_price: number;
}

export async function listOrdersForStall(stallId: string, status?: OrderStatus) {
  const supabase = createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, contact_name, contact_mobile, table_number")
    .eq("stall_id", stallId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders, error } = await query;
  if (error || !orders) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, item_name, quantity, unit_price")
    .in("order_id", orderIds);

  const itemsByOrder = new Map<string, StallOrderItem[]>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status as OrderStatus,
    total: Number(o.total),
    createdAt: o.created_at,
    customerName: o.contact_name ?? "—",
    customerMobile: o.contact_mobile ?? "—",
    tableNumber: o.table_number,
    items: itemsByOrder.get(o.id) ?? [],
  }));
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "ready",
  ready: "completed",
};

export function nextStatusFor(status: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[status] ?? null;
}

/**
 * Request-scoped client — the owner's own session. RLS's "owner
 * updates own stall orders" policy plus the status-transition
 * trigger do the real enforcement: an owner can only move their own
 * stall's orders through the legal sequence, nothing more.
 */
export async function advanceOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
  return { error: error?.message };
}

export async function completeOrderWithCode(orderId: string, code: string) {
  const supabase = createClient();
  const { data: order } = await supabase.from("orders").select("pickup_code").eq("id", orderId).single();

  if (!order || order.pickup_code !== code) {
    return { error: "Incorrect pickup code." };
  }

  const { error } = await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);
  return { error: error?.message };
}

export async function cancelOrder(orderId: string, reason: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", cancellation_reason: reason })
    .eq("id", orderId);
  return { error: error?.message };
}
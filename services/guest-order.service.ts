import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import type { PlaceOrderItem } from "./customer-order.service";

export interface PlaceGuestOrderContact {
  contactName: string;
  contactMobile: string;
  tableNumber?: string;
}

/**
 * Guest orders have no logged-in session at all, so this goes
 * through the service-role client — same trusted-server pattern used
 * elsewhere in this app for operations RLS can't cover for an
 * unauthenticated caller. The guest_token this generates is the
 * ONLY way anyone can ever read this order back (see
 * get_guest_order in the migration) — nothing else exposes it.
 */
export async function placeGuestOrder(stallId: string, items: PlaceOrderItem[], contact: PlaceGuestOrderContact) {
  const admin = createServiceRoleClient();

  const itemIds = items.map((i) => i.menuItemId);
  const { data: dbItems, error: fetchError } = await admin
    .from("menu_items")
    .select("id, name, price, is_available, stall_id")
    .in("id", itemIds);

  if (fetchError || !dbItems || dbItems.length !== items.length) {
    return { error: "Some items could not be found. Please refresh your cart." };
  }

  const unavailable = dbItems.find((i) => !i.is_available || i.stall_id !== stallId);
  if (unavailable) {
    return { error: `"${unavailable.name}" is no longer available.` };
  }

  const priceById = new Map(dbItems.map((i) => [i.id, Number(i.price)]));
  const total = items.reduce((sum, i) => sum + (priceById.get(i.menuItemId) ?? 0) * i.quantity, 0);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: null,
      stall_id: stallId,
      total,
      status: "pending",
      contact_name: contact.contactName,
      contact_mobile: contact.contactMobile,
      table_number: contact.tableNumber || null,
      guest_token: crypto.randomUUID(),
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Could not place order." };
  }

  const orderItems = items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menuItemId,
    item_name: i.name,
    unit_price: priceById.get(i.menuItemId) ?? i.price,
    quantity: i.quantity,
    subtotal: (priceById.get(i.menuItemId) ?? i.price) * i.quantity,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);

  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "Could not save order items. Please try again." };
  }

  return { order };
}

export interface GuestOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  stallName: string;
  contactName: string | null;
  contactMobile: string | null;
  tableNumber: string | null;
  pickupCode: string | null;
  cancellationReason: string | null;
}

export async function getGuestOrder(token: string): Promise<GuestOrderDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_guest_order", { p_token: token }).single();

  if (error || !data) return null;

  return {
    id: (data as any).id,
    orderNumber: (data as any).order_number,
    status: (data as any).status,
    total: Number((data as any).total),
    createdAt: (data as any).created_at,
    stallName: (data as any).stall_name,
    contactName: (data as any).contact_name,
    contactMobile: (data as any).contact_mobile,
    tableNumber: (data as any).table_number,
    pickupCode: (data as any).pickup_code,
    cancellationReason: (data as any).cancellation_reason,
  };
}

export async function getGuestOrderItems(token: string) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_guest_order_items", { p_token: token });
  return data ?? [];
}

export async function cancelGuestOrder(token: string) {
  const admin = createServiceRoleClient();

  const { data: order } = await admin.from("orders").select("id, status").eq("guest_token", token).single();

  if (!order) return { error: "Order not found." };
  if (order.status !== "pending") return { error: "This order can no longer be cancelled." };

  const { error } = await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
  return { error: error?.message };
}
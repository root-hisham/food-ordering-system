import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

export interface PlaceOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function listCustomerActiveOrders(customerId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, stalls(name)")
    .eq("customer_id", customerId)
    .in("status", ["pending", "accepted", "ready"])
    .order("created_at", { ascending: false });

  return (data ?? []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status as OrderStatus,
    total: Number(o.total),
    createdAt: o.created_at,
    stallName: o.stalls?.name ?? "—",
  }));
}

export async function listCustomerHistory(customerId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, stalls(name)")
    .eq("customer_id", customerId)
    .in("status", ["completed", "cancelled"])
    .order("created_at", { ascending: false });

  return (data ?? []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status as OrderStatus,
    total: Number(o.total),
    createdAt: o.created_at,
    stallName: o.stalls?.name ?? "—",
  }));
}

export async function getOrderDetail(orderId: string, customerId: string) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total, created_at, stall_id, customer_id, pickup_code, cancellation_reason, table_number, stalls(name)"
    )
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== customerId) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("item_name, quantity, unit_price, subtotal")
    .eq("order_id", orderId);

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as OrderStatus,
    total: Number(order.total),
    createdAt: order.created_at,
    stallName: (order as any).stalls?.name ?? "—",
    pickupCode: order.pickup_code,
    cancellationReason: order.cancellation_reason,
    tableNumber: order.table_number,
    items: items ?? [],
  };
}

export async function getOrderForReorder(orderId: string, customerId: string) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, stall_id, customer_id, stalls(name)")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== customerId) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("menu_item_id, item_name, unit_price, quantity")
    .eq("order_id", orderId);

  return {
    stallId: order.stall_id,
    stallName: (order as any).stalls?.name ?? "Stall",
    items: (items ?? []).filter((i) => i.menu_item_id),
  };
}
export interface PlaceOrderContact {
  contactName: string;
  contactMobile: string;
  tableNumber?: string;
}

export async function placeOrderAsCustomer(
  customerId: string,
  stallId: string,
  items: PlaceOrderItem[],
  contact: PlaceOrderContact
) {
  const supabase = createClient();

  const itemIds = items.map((i) => i.menuItemId);
  const { data: dbItems, error: fetchError } = await supabase
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      stall_id: stallId,
      total,
      status: "pending",
      contact_name: contact.contactName,
      contact_mobile: contact.contactMobile,
      table_number: contact.tableNumber || null,
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

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "Could not save order items. Please try again." };
  }

  return { order };
}
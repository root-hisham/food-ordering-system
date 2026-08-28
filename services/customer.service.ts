import { createClient } from "@/lib/supabase/server";

export async function listCustomersForAdmin() {
  const supabase = createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, is_active, profiles(full_name, mobile_number, created_at)");

  if (error || !customers) return [];

  const customerIds = customers.map((c) => c.id);

  const { data: orderStats } = await supabase
    .from("orders")
    .select("customer_id, total")
    .in("customer_id", customerIds);

  const statsByCustomer = new Map<string, { count: number; total: number }>();
  for (const order of orderStats ?? []) {
    const current = statsByCustomer.get(order.customer_id) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += Number(order.total);
    statsByCustomer.set(order.customer_id, current);
  }

  return customers.map((c: any) => ({
    id: c.id,
    isActive: c.is_active,
    fullName: c.profiles?.full_name ?? "—",
    mobileNumber: c.profiles?.mobile_number ?? "—",
    totalOrders: statsByCustomer.get(c.id)?.count ?? 0,
    totalSpent: statsByCustomer.get(c.id)?.total ?? 0,
  }));
}

export async function setCustomerActive(customerId: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").update({ is_active: isActive }).eq("id", customerId);
  return { error: error?.message };
}
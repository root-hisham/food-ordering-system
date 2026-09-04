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

/**
 * Guests never create an account, so there's no `customers`/`profiles`
 * row for them — the only record of who they are lives on their orders'
 * contact_name/contact_mobile. This groups those by mobile number (the
 * one stable identifier a guest gives us) so an admin can see repeat
 * guest activity without requiring sign-up.
 */
export async function listGuestOrderersForAdmin() {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("contact_name, contact_mobile, total, created_at")
    .is("customer_id", null)
    .not("contact_mobile", "is", null)
    .order("created_at", { ascending: false });

  const byMobile = new Map<
    string,
    { name: string; mobile: string; totalOrders: number; totalSpent: number; lastOrderAt: string }
  >();

  for (const o of orders ?? []) {
    const key = o.contact_mobile as string;
    const existing = byMobile.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += Number(o.total);
    } else {
      byMobile.set(key, {
        name: o.contact_name ?? "—",
        mobile: key,
        totalOrders: 1,
        totalSpent: Number(o.total),
        lastOrderAt: o.created_at,
      });
    }
  }

  return [...byMobile.values()].sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );
}

export async function setCustomerActive(customerId: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").update({ is_active: isActive }).eq("id", customerId);
  return { error: error?.message };
}
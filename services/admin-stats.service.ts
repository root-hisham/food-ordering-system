import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardStats() {
  const supabase = createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalStalls },
    { count: activeStalls },
    { count: totalCustomers },
    { data: todayOrders },
    { count: pendingOrders },
    { count: completedOrders },
  ] = await Promise.all([
    supabase.from("stalls").select("*", { count: "exact", head: true }),
    supabase.from("stalls").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalStalls: totalStalls ?? 0,
    activeStalls: activeStalls ?? 0,
    totalCustomers: totalCustomers ?? 0,
    todayOrders: todayOrders?.length ?? 0,
    todayRevenue,
    pendingOrders: pendingOrders ?? 0,
    completedOrders: completedOrders ?? 0,
  };
}
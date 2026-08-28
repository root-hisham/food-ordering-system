import { createClient } from "@/lib/supabase/server";

export async function getOwnerDashboardStats(stallId: string) {
  const supabase = createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { data: todayOrders },
    { count: pendingOrders },
    { count: cookingOrders },
    { count: readyOrders },
    { count: completedOrders },
    { count: totalOrders },
  ] = await Promise.all([
    supabase.from("orders").select("total").eq("stall_id", stallId).gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("stall_id", stallId).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("stall_id", stallId).eq("status", "cooking"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("stall_id", stallId).eq("status", "ready"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("stall_id", stallId).eq("status", "completed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("stall_id", stallId),
  ]);

  const todaySales = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    todayOrders: todayOrders?.length ?? 0,
    todaySales,
    pendingOrders: pendingOrders ?? 0,
    cookingOrders: cookingOrders ?? 0,
    readyOrders: readyOrders ?? 0,
    completedOrders: completedOrders ?? 0,
    totalOrders: totalOrders ?? 0,
  };
}
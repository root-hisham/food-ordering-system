import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { getOwnerDashboardStats } from "@/services/owner-stats.service";

export default async function OwnerDashboardPage() {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);

  if (!stallId) {
    return <p className="text-neutral-500">No stall linked to this account.</p>;
  }

  const stats = await getOwnerDashboardStats(stallId);

  const cards = [
    { label: "Today's Orders", value: stats.todayOrders },
    { label: "Today's Sales", value: `₹${stats.todaySales.toFixed(2)}` },
    { label: "Pending", value: stats.pendingOrders },
    { label: "Ready", value: stats.readyOrders },
    { label: "Completed", value: stats.completedOrders },
    { label: "Total Orders", value: stats.totalOrders },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
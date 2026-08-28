import { getAdminDashboardStats } from "@/services/admin-stats.service";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Total Stalls", value: stats.totalStalls },
    { label: "Active Stalls", value: stats.activeStalls },
    { label: "Total Customers", value: stats.totalCustomers },
    { label: "Today's Orders", value: stats.todayOrders },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(2)}` },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Completed Orders", value: stats.completedOrders },
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
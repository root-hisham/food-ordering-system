import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { listCustomerActiveOrders } from "@/services/customer-order.service";

export default async function OrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/orders");

  const orders = await listCustomerActiveOrders(profile.id);

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="mb-4 text-xl font-semibold">Active Orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No active orders right now.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex justify-between">
                <p className="font-mono text-xs text-neutral-400">{o.orderNumber}</p>
                <p className="text-xs font-medium capitalize text-brand-600">{o.status}</p>
              </div>
              <p className="mt-1 font-medium">{o.stallName}</p>
              <p className="text-sm text-neutral-500">₹{o.total.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
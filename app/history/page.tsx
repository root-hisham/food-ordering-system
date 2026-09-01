import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { listCustomerHistory } from "@/services/customer-order.service";
import { OrderAgainButton } from "./OrderAgainButton";

export default async function HistoryPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/history");

  const orders = await listCustomerHistory(profile.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 bg-[length:200%_200%] animate-gradient-shift">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        <h1 className="mb-4 text-xl font-semibold">Order History</h1>

        {orders.length === 0 ? (
          <p className="text-neutral-500">No past orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                <div className="flex justify-between">
                  <p className="font-mono text-xs text-neutral-400">{o.orderNumber}</p>
                  <p
                    className={`text-xs font-medium capitalize ${
                      o.status === "cancelled" ? "text-red-500" : "text-neutral-500"
                    }`}
                  >
                    {o.status}
                  </p>
                </div>
                <p className="mt-1 font-medium">{o.stallName}</p>
                <p className="text-sm text-neutral-500">₹{o.total.toFixed(2)}</p>
                <div className="mt-2">
                  <OrderAgainButton orderId={o.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

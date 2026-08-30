import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { listOrdersForStall, nextStatusFor } from "@/services/order.service";
import { ALL_STATUSES, type OrderStatus } from "@/types/order";
import { OrderActionButtons } from "./OrderActionButtons";
import { OwnerOrdersRealtimeListener } from "@/components/owner/OwnerOrdersRealtimeListener";

export default async function OwnerOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const status = searchParams.status as OrderStatus | undefined;

  if (!stallId) {
    return <p className="text-neutral-500">No stall linked to this account.</p>;
  }

  const orders = await listOrdersForStall(stallId, status);

  return (
    <div>
      <OwnerOrdersRealtimeListener stallId={stallId} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/owner/orders"
            className={`rounded-full px-3 py-1 ${!status ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
          >
            All
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/owner/orders?status=${s}`}
              className={`rounded-full px-3 py-1 capitalize ${
                status === s ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No orders in this view.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-neutral-400">{order.orderNumber}</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-neutral-500">{order.customerMobile}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                  <p className="text-xs capitalize text-neutral-500">{order.status}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}× {item.item_name} — ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <OrderActionButtons orderId={order.id} status={order.status} nextStatus={nextStatusFor(order.status)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
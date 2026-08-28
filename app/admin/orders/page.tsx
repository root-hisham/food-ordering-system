import Link from "next/link";
import { listOrdersForAdmin } from "@/services/order.service";
import { ALL_STATUSES, type OrderStatus } from "@/types/order";
import { OrderStatusSelect } from "./OrderStatusSelect";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status as OrderStatus | undefined;
  const orders = await listOrdersForAdmin(status ? { status } : {});

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/orders"
            className={`rounded-full px-3 py-1 ${!status ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
          >
            All
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
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
        <p className="text-neutral-500">No orders found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Stall</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Override</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.stallName}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">₹{o.total.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
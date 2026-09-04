import { listCustomersForAdmin, listGuestOrderersForAdmin } from "@/services/customer.service";
import { ToggleCustomerActiveButton } from "./ToggleCustomerActiveButton";

export default async function AdminCustomersPage() {
  const [customers, guests] = await Promise.all([
    listCustomersForAdmin(),
    listGuestOrderersForAdmin(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 text-xl font-semibold">Customers</h1>

        {customers.length === 0 ? (
          <p className="text-neutral-500">No customers yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-medium">{c.fullName}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.mobileNumber}</td>
                    <td className="px-4 py-3">{c.totalOrders}</td>
                    <td className="px-4 py-3">₹{c.totalSpent.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          c.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {c.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ToggleCustomerActiveButton customerId={c.id} isActive={c.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold">Guest Orders</h2>
        <p className="mb-6 text-sm text-neutral-500">
          People who ordered without creating an account. Grouped by mobile number from what they
          entered at checkout — there&apos;s no account to activate/deactivate here.
        </p>

        {guests.length === 0 ? (
          <p className="text-neutral-500">No guest orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.mobile} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{g.mobile}</td>
                    <td className="px-4 py-3">{g.totalOrders}</td>
                    <td className="px-4 py-3">₹{g.totalSpent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

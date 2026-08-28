import Link from "next/link";
import { listStallsWithOwners } from "@/services/stall.service";
import { ToggleStallStatusButton } from "./ToggleStallStatusButton";

export default async function AdminStallsPage() {
  const stalls = await listStallsWithOwners();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Stalls</h1>
        <Link
          href="/admin/stalls/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New Stall
        </Link>
      </div>

      {stalls.length === 0 ? (
        <p className="text-neutral-500">No stalls yet. Create the first one.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3">Stall</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stalls.map((stall: any) => (
                <tr key={stall.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{stall.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{stall.category ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {stall.owner?.full_name ?? "—"}
                    {stall.owner?.mobile_number && (
                      <span className="block text-xs">{stall.owner.mobile_number}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        stall.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {stall.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleStallStatusButton stallId={stall.id} status={stall.status} />
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
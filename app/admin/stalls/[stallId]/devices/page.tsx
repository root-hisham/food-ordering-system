import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getStallById, getStallOwnerProfile } from "@/services/stall.service";
import { listActiveOwnerSessions } from "@/services/owner-session.service";
import { DeviceLimitForm } from "./DeviceLimitForm";
import { RevokeSessionButton } from "./RevokeSessionButton";

export default async function StallDevicesPage({ params }: { params: { stallId: string } }) {
  await requireRole(["admin"]);

  const [stall, owner] = await Promise.all([
    getStallById(params.stallId),
    getStallOwnerProfile(params.stallId),
  ]);

  if (!stall) notFound();

  const sessions = owner ? await listActiveOwnerSessions(owner.ownerId) : [];

  return (
    <div className="max-w-2xl">
      <Link href="/admin/stalls" className="text-sm font-medium text-neutral-500 hover:text-brand-600">
        ← Back to Stalls
      </Link>

      <h1 className="mt-2 text-xl font-semibold">{stall.name} — Devices</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {owner
          ? `Owner: ${owner.fullName ?? "—"} (${owner.mobileNumber ?? "no mobile on file"})`
          : "No owner linked to this stall."}
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-700">Device limit</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Maximum number of devices this stall&apos;s owner can be logged in on at the same time.
          A login attempt beyond this limit is rejected until a device is freed up.
        </p>
        <DeviceLimitForm stallId={stall.id} currentLimit={stall.device_limit ?? 2} />
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-700">
            Active devices ({sessions.length})
          </h2>
        </div>

        {!owner ? (
          <p className="px-4 py-6 text-sm text-neutral-500">Link an owner to this stall first.</p>
        ) : sessions.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">No active sessions right now.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {s.device_label ?? "Unknown device"}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {s.ip_address ?? "Unknown IP"} · Logged in {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
                <RevokeSessionButton stallId={stall.id} sessionId={s.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
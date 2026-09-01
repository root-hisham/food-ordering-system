import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { SignOutButton } from "@/components/common/SignOutButton";
import { getOwnerStallId } from "@/lib/auth/stall";
import { getStallById } from "@/services/stall.service";
import { StallAvailabilityToggle } from "@/components/owner/StallAvailabilityToggle";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const stall = stallId ? await getStallById(stallId) : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Stall Owner</p>
          <p className="font-semibold">{profile.full_name}</p>
        </div>
        <SignOutButton />
      </header>
      {stall && (
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <StallAvailabilityToggle initial={stall.availability ?? "open"} />
        </div>
      )}
      <nav className="flex gap-4 border-b border-neutral-200 bg-white px-6 py-2 text-sm">
        <Link href="/owner" className="font-medium text-neutral-600 hover:text-brand-600">
          Dashboard
        </Link>
        <Link href="/owner/orders" className="font-medium text-neutral-600 hover:text-brand-600">
          Orders
        </Link>
        <Link href="/owner/menu" className="font-medium text-neutral-600 hover:text-brand-600">
          Menu
        </Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}

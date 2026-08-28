import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { listMenuItems } from "@/services/menu.service";
import { MenuItemRow } from "./MenuItemRow";

export default async function OwnerMenuPage() {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const items = stallId ? await listMenuItems(stallId) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Menu</h1>
        <div className="flex gap-2">
          <Link
            href="/owner/categories"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Categories
          </Link>
          <Link
            href="/owner/menu/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + New Item
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-500">No menu items yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item: any) => (
            <MenuItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
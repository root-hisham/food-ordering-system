import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { listCategories } from "@/services/menu.service";
import { NewMenuItemForm } from "./NewMenuItemForm";

export default async function NewMenuItemPage() {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const categories = stallId ? await listCategories(stallId) : [];

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">New Menu Item</h1>
      <NewMenuItemForm categories={categories} />
    </div>
  );
}
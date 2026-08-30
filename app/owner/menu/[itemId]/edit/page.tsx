import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { getMenuItemById, listCategories } from "@/services/menu.service";
import { EditMenuItemForm } from "./EditMenuItemForm";

export default async function EditMenuItemPage({ params }: { params: { itemId: string } }) {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const item = await getMenuItemById(params.itemId);
  if (!item || !stallId) notFound();

  const categories = await listCategories(stallId);

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Edit Menu Item</h1>
      <EditMenuItemForm item={item} categories={categories} />
    </div>
  );
}
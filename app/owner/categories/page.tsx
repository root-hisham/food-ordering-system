import { requireRole } from "@/lib/auth/session";
import { getOwnerStallId } from "@/lib/auth/stall";
import { listCategories } from "@/services/menu.service";
import { NewCategoryForm } from "./NewCategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export default async function OwnerCategoriesPage() {
  const profile = await requireRole(["stall_owner"]);
  const stallId = await getOwnerStallId(profile.id);
  const categories = stallId ? await listCategories(stallId) : [];

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">Menu Categories</h1>

      <NewCategoryForm />

      <div className="mt-6 space-y-2">
        {categories.length === 0 ? (
          <p className="text-neutral-500">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              <span>{c.name}</span>
              <DeleteCategoryButton categoryId={c.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
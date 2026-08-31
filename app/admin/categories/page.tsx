import { listCategories } from "@/services/category.service";
import { NewCategoryForm } from "./NewCategoryForm";
import { CategoryRow } from "./CategoryRow";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-xl font-semibold">Home Page Chips</h1>
      <p className="mb-6 text-sm text-neutral-500">
        These are the category chips (Burgers, Momos, Fries...) shown at the top of the customer home page. Assign
        stalls to a chip from the stall's edit page.
      </p>

      <NewCategoryForm />

      <div className="mt-6 space-y-2">
        {categories.length === 0 ? (
          <p className="text-neutral-500">No chips yet — add one above.</p>
        ) : (
          categories.map((c) => <CategoryRow key={c.id} category={c} />)
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getStallById } from "@/services/stall.service";
import { listCategories } from "@/services/category.service";
import { EditStallForm } from "./EditStallForm";

export default async function EditStallPage({ params }: { params: { stallId: string } }) {
  const [stall, categories] = await Promise.all([
    getStallById(params.stallId),
    listCategories(),
  ]);
  if (!stall) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Edit Stall</h1>
      <EditStallForm stall={stall} categories={categories} />
    </div>
  );
}

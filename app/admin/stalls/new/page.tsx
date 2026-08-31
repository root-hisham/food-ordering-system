import { listCategories } from "@/services/category.service";
import { NewStallForm } from "./NewStallForm";

export default async function NewStallPage() {
  const categories = await listCategories();
  return <NewStallForm categories={categories} />;
}

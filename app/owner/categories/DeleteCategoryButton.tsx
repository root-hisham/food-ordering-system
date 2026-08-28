"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "./actions";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteCategoryAction(categoryId))}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
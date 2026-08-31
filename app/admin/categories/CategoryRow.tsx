"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "./actions";
import type { Category } from "@/types/category";

export function CategoryRow({ category }: { category: Category }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {category.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.icon_url} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-neutral-100" />
        )}
        <div>
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-neutral-400">Order {category.sort_order}</p>
        </div>
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteCategoryAction(category.id))}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

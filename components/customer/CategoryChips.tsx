import Link from "next/link";
import { Grid2x2 } from "lucide-react";
import type { Category } from "@/types/category";

export function CategoryChips({
  categories,
  activeCategoryId,
}: {
  categories: Category[];
  activeCategoryId?: string;
}) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      <Link href="/" scroll={false} className="flex shrink-0 flex-col items-center gap-1.5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-200 ${
            !activeCategoryId
              ? "border-brand-500 bg-brand-50 text-brand-600 shadow-sm scale-105"
              : "border-neutral-200 bg-white text-neutral-400 hover:border-brand-300"
          }`}
        >
          <Grid2x2 size={24} />
        </div>
        <span className={`text-xs font-medium ${!activeCategoryId ? "text-brand-600" : "text-neutral-500"}`}>
          All
        </span>
      </Link>

      {categories.map((c) => {
        const active = c.id === activeCategoryId;
        return (
          <Link
            key={c.id}
            href={`/?category=${c.id}`}
            scroll={false}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <div
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-200 ${
                active
                  ? "border-brand-500 bg-brand-50 shadow-sm scale-105"
                  : "border-neutral-200 bg-white hover:border-brand-300"
              }`}
            >
              {c.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.icon_url} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
            </div>
            <span className={`max-w-[4rem] truncate text-xs font-medium ${active ? "text-brand-600" : "text-neutral-500"}`}>
              {c.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

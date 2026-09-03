"use client";

import { useMemo, useState } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import { MenuItemRow } from "./MenuItemRow";

export function MenuList({ items }: { items: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search menu items..."
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-8 text-center text-neutral-500">
          {query ? `No items match "${query}".` : "No menu items yet."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <MenuItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { SearchInput } from "@/components/common/SearchInput";
import type { MenuCategory, MenuItem } from "@/types/menu";

export function MenuBrowser({
  stallId,
  stallName,
  stallActive,
  categories,
  items,
}: {
  stallId: string;
  stallName: string;
  stallActive: boolean;
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const cart = useCartStore();
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of filteredItems) {
      const key = item.category_id ?? "uncategorized";
      const list = byCategory.get(key) ?? [];
      list.push(item);
      byCategory.set(key, list);
    }
    return byCategory;
  }, [filteredItems]);

  const handleAdd = (item: MenuItem) => {
    const result = cart.addItem(stallId, stallName, {
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
    });

    if (result === "conflict") {
      const confirmed = window.confirm(
        `Your cart contains items from ${cart.stallName}. Clear cart and add this item instead?`
      );
      if (confirmed) {
        cart.clearCart();
        cart.addItem(stallId, stallName, {
          menuItemId: item.id,
          name: item.name,
          price: Number(item.price),
        });
      }
    }
  };

  const qtyFor = (itemId: string) => cart.items.find((i) => i.menuItemId === itemId)?.quantity ?? 0;

  return (
    <div className="space-y-6">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={`Search food in ${stallName}...`}
      />

      {query && filteredItems.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-8 text-center text-sm text-neutral-500">
          No items match &ldquo;{query}&rdquo;.
        </p>
      )}

      {[...grouped.entries()].map(([categoryId, categoryItems]) => {
        const category = categories.find((c) => c.id === categoryId);
        return (
          <div key={categoryId}>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500">{category?.name ?? "Other"}</h2>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const qty = qtyFor(item.id);
                return (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                    {item.image_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.name} <span className="text-xs">{item.is_veg ? "🟢" : "🔴"}</span>
                      </p>
                      {item.description && <p className="text-xs text-neutral-500">{item.description}</p>}
                      <div className="mt-1 flex items-center justify-between">
                        <p className="font-semibold">₹{Number(item.price).toFixed(2)}</p>
                        {!item.is_available ? (
                          <span className="text-xs font-medium text-neutral-400">Currently Unavailable</span>
                        ) : !stallActive ? (
                          <span className="text-xs font-medium text-neutral-400">Stall closed</span>
                        ) : qty === 0 ? (
                          <button
                            data-ripple
                            onClick={() => handleAdd(item)}
                            className="rounded-lg bg-brand-600 px-3 py-1 text-sm font-medium text-white hover:bg-brand-700"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              data-ripple
                              onClick={() => cart.decrementItem(item.id)}
                              className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm">{qty}</span>
                            <button
                              data-ripple
                              onClick={() => cart.incrementItem(item.id)}
                              className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
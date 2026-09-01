"use client";

import { useMemo } from "react";
import { useCartStore } from "@/store/cart-store";
import type { MenuCategory, MenuItem } from "@/types/menu";
import type { StallAvailability } from "@/types/stall";

const UNAVAILABLE_LABEL: Record<StallAvailability, string> = {
  open: "Stall closed", // shouldn't hit this case while canOrder is true, kept as a safe fallback
  opening_soon: "Opening soon",
  closed: "Stall closed",
};

export function MenuBrowser({
  stallId,
  stallName,
  canOrder,
  availability,
  categories,
  items,
}: {
  stallId: string;
  stallName: string;
  canOrder: boolean;
  availability: StallAvailability;
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const cart = useCartStore();

  const grouped = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of items) {
      const key = item.category_id ?? "uncategorized";
      const list = byCategory.get(key) ?? [];
      list.push(item);
      byCategory.set(key, list);
    }
    return byCategory;
  }, [items]);

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
      {!canOrder && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          {availability === "opening_soon"
            ? "This stall hasn't opened yet. You can browse the menu, but ordering isn't available until it opens."
            : "This stall is closed right now. You can browse the menu, but ordering isn't available."}
        </div>
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
                      <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-neutral-100" />
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
                        ) : !canOrder ? (
                          <span className="text-xs font-medium text-neutral-400">
                            {UNAVAILABLE_LABEL[availability]}
                          </span>
                        ) : qty === 0 ? (
                          <button
                            onClick={() => handleAdd(item)}
                            className="rounded-lg bg-brand-600 px-3 py-1 text-sm font-medium text-white hover:bg-brand-700"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => cart.decrementItem(item.id)}
                              className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm">{qty}</span>
                            <button
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

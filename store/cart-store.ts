"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  stallId: string | null;
  stallName: string | null;
  items: CartItem[];
  addItem: (
    stallId: string,
    stallName: string,
    item: Omit<CartItem, "quantity">
  ) => "added" | "conflict";
  removeItem: (menuItemId: string) => void;
  incrementItem: (menuItemId: string) => void;
  decrementItem: (menuItemId: string) => void;
  clearCart: () => void;
  total: () => number;
}

// A cart can only ever hold items from one stall — addItem returns
// "conflict" instead of silently mixing stalls, so the UI can prompt
// "clear cart and add this item?" per the spec's cart rule.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      stallId: null,
      stallName: null,
      items: [],
      addItem: (stallId, stallName, item) => {
        const state = get();
        if (state.stallId && state.stallId !== stallId) {
          return "conflict";
        }
        set((s) => {
          const existing = s.items.find((i) => i.menuItemId === item.menuItemId);
          const items = existing
            ? s.items.map((i) =>
                i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...s.items, { ...item, quantity: 1 }];
          return { stallId, stallName, items };
        });
        return "added";
      },
      removeItem: (menuItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.menuItemId !== menuItemId) })),
      incrementItem: (menuItemId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),
      decrementItem: (menuItemId) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ stallId: null, stallName: null, items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "food-court-cart" }
  )
);
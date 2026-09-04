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
  ownerUserId: string | null | undefined; // whose session this cart belongs to
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
  /**
   * Call whenever the active session's customer id is known (e.g. from the
   * root layout on every page load). Cookies — and this cart's localStorage
   * key — are shared by every tab in the browser, so if the signed-in
   * customer id has changed since the cart was last touched (another tab
   * logged out, logged in as someone else, or became an owner/admin/guest
   * session), the old cart no longer belongs to whoever is looking at it
   * now and must be dropped rather than silently reused or checked out.
   */
  syncIdentity: (currentUserId: string | null) => void;
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
      ownerUserId: undefined,
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
      syncIdentity: (currentUserId) => {
        const state = get();
        // undefined = never checked yet, so first run just records identity
        // without wiping a cart someone built before this code shipped.
        if (state.ownerUserId === undefined) {
          set({ ownerUserId: currentUserId });
          return;
        }
        if (state.ownerUserId !== currentUserId) {
          set({ stallId: null, stallName: null, items: [], ownerUserId: currentUserId });
        }
      },
    }),
    { name: "food-court-cart" }
  )
);
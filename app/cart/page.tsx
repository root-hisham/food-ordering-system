"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const cart = useCartStore();

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-8 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Browse stalls and add something tasty.</p>
        <Link href="/stalls" className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-white">
          Browse Stalls
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="mb-1 text-xl font-semibold">Your Cart</h1>
      <p className="mb-4 text-sm text-neutral-500">{cart.stallName}</p>

      <div className="space-y-2">
        {cart.items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500">₹{item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cart.decrementItem(item.menuItemId)}
                  className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                >
                  −
                </button>
                <span className="w-4 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => cart.incrementItem(item.menuItemId)}
                  className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => cart.removeItem(item.menuItemId)}
                className="text-xs font-medium text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="font-medium">Total</span>
        <span className="text-lg font-semibold">₹{cart.total().toFixed(2)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-4 block rounded-xl bg-brand-600 py-3 text-center font-medium text-white hover:bg-brand-700"
      >
        Proceed to Checkout
      </Link>
    </main>
  );
}
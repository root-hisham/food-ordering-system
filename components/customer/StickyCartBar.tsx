"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

export function StickyCartBar() {
  const pathname = usePathname();
  const cart = useCartStore();
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  if (itemCount === 0 || pathname === "/cart" || pathname === "/checkout") {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed bottom-16 left-4 right-4 z-20 flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white shadow-lg"
    >
      <span className="text-sm font-medium">
        {itemCount} item{itemCount > 1 ? "s" : ""} · {cart.stallName}
      </span>
      <span className="text-sm font-semibold">₹{cart.total().toFixed(2)} · View Cart</span>
    </Link>
  );
}
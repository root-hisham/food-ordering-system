"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { getReorderDataAction } from "./actions";

export function OrderAgainButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const cart = useCartStore();

  const handleClick = () => {
    startTransition(async () => {
      const data = await getReorderDataAction(orderId);
      if (!data || data.items.length === 0) return;

      cart.clearCart();
      for (const item of data.items) {
        cart.addItem(data.stallId, data.stallName, {
          menuItemId: item.menu_item_id,
          name: item.item_name,
          price: Number(item.unit_price),
        });
        for (let i = 1; i < item.quantity; i++) {
          cart.incrementItem(item.menu_item_id);
        }
      }
      router.push("/cart");
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      {isPending ? "Loading..." : "Order Again"}
    </button>
  );
}
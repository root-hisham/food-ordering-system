"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { placeOrderAction } from "./actions";

export function CheckoutForm() {
  const cart = useCartStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (cart.items.length === 0) {
    return <p className="text-neutral-500">Your cart is empty.</p>;
  }

  const handlePlaceOrder = () => {
    setError("");
    startTransition(async () => {
      const result = await placeOrderAction(
        cart.stallId!,
        cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        }))
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      cart.clearCart();
      router.push(`/orders/${result.orderId}`);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-neutral-500">{cart.stallName}</p>
        <div className="space-y-1 text-sm">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 font-semibold">
          <span>Total</span>
          <span>₹{cart.total().toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium">Payment</p>
        <p className="mt-1 text-sm text-neutral-500">Pay at Counter (Cash on Pickup)</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={isPending}
        className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
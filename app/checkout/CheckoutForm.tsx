"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { placeOrderAction } from "./actions";
import { GuestChoiceModal } from "./GuestChoiceModal";

export function CheckoutForm({
  isLoggedIn,
  defaultName,
  defaultMobile,
}: {
  isLoggedIn: boolean;
  defaultName: string;
  defaultMobile: string;
}) {
  const cart = useCartStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState(defaultName);
  const [mobile, setMobile] = useState(defaultMobile);
  const [table, setTable] = useState("");
  const [showGuestChoice, setShowGuestChoice] = useState(!isLoggedIn);
  const [continuingAsGuest, setContinuingAsGuest] = useState(false);

  if (cart.items.length === 0) {
    return <p className="text-neutral-500">Your cart is empty.</p>;
  }

  // Not logged in and haven't chosen guest yet — show only the choice popup.
  if (showGuestChoice) {
    return (
      <GuestChoiceModal
        onContinueAsGuest={() => {
          setShowGuestChoice(false);
          setContinuingAsGuest(true);
        }}
        onClose={() => router.push("/cart")}
      />
    );
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
        })),
        name,
        mobile,
        table
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      cart.clearCart();

      if (result.guestToken) {
        router.push(`/checkout/guest/${result.guestToken}`);
      } else {
        router.push(`/orders/${result.orderId}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {continuingAsGuest && (
        <p className="rounded-xl bg-pink-50 p-3 text-xs text-pink-700">
          Ordering as a guest — save the link on the next page to track your order, since it won&apos;t be saved to any account.
        </p>
      )}

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

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-600">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-600">Mobile number</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            pattern="\d{10}"
            placeholder="9876543210"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-600">Table number (optional)</label>
          <input
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder="e.g. 12"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3"
          />
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
        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-3 font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
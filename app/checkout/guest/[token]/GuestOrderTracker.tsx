"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notifications/sound";

const STEPS = ["pending", "accepted", "ready", "completed"];
const STEP_LABEL: Record<string, string> = {
  pending: "Order Placed",
  accepted: "Accepted",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface GuestOrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  stallName: string;
  contactName: string | null;
  contactMobile: string | null;
  tableNumber: string | null;
  pickupCode: string | null;
  cancellationReason: string | null;
}

export function GuestOrderTracker({
  token,
  initialOrder,
  initialItems,
}: {
  token: string;
  initialOrder: GuestOrderData;
  initialItems: any[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [items] = useState(initialItems);
  const [showReady, setShowReady] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const prevStatus = useRef(initialOrder.status);

  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data } = await supabase.rpc("get_guest_order", { p_token: token }).single();
      if (!data) return;

      const mapped: GuestOrderData = {
        id: (data as any).id,
        orderNumber: (data as any).order_number,
        status: (data as any).status,
        total: Number((data as any).total),
        stallName: (data as any).stall_name,
        contactName: (data as any).contact_name,
        contactMobile: (data as any).contact_mobile,
        tableNumber: (data as any).table_number,
        pickupCode: (data as any).pickup_code,
        cancellationReason: (data as any).cancellation_reason,
      };

      if (mapped.status !== prevStatus.current) {
        if (mapped.status === "ready") {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          playNotificationSound();
          setShowReady(true);
        }
        if (mapped.status === "cancelled") {
          setShowCancelled(true);
        }
        prevStatus.current = mapped.status;
      }
      setOrder(mapped);
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const handleCancel = async () => {
    setIsCancelling(true);
    const { cancelGuestOrderAction } = await import("./actions");
    const result = await cancelGuestOrderAction(token);
    setIsCancelling(false);
    if (!result.error) {
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    }
  };

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div>
      <p className="rounded-xl bg-pink-50 p-3 text-xs text-pink-700">
        Bookmark this page — it&apos;s the only way to check your order, since no account was created.
      </p>

      <p className="mt-4 font-mono text-xs text-neutral-400">{order.orderNumber}</p>
      <h1 className="text-xl font-semibold">{order.stallName}</h1>
      {order.tableNumber && <p className="text-sm text-neutral-500">Table {order.tableNumber}</p>}

      {order.status === "cancelled" ? (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">This order was cancelled.</p>
          {order.cancellationReason && <p className="mt-1">Reason: {order.cancellationReason}</p>}
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {STEPS.map((step, i) => {
              const done = currentStepIndex >= i;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      done ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-400"
                    }`}
                  >
                    {done ? "✓" : ""}
                  </div>
                  <span className={done ? "font-medium" : "text-neutral-400"}>{STEP_LABEL[step]}</span>
                </div>
              );
            })}
          </div>

          {order.status === "ready" && (
            <p className="mt-4 rounded-xl bg-green-50 p-4 text-center font-medium text-green-700">
              🎉 Your food is ready! Please pick it up.
            </p>
          )}

          {order.pickupCode && order.status !== "completed" && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50 p-4 text-center">
              <p className="text-xs text-neutral-500">Show this code at pickup</p>
              <p className="mt-1 text-3xl font-bold tracking-widest text-pink-600">{order.pickupCode}</p>
            </div>
          )}

          {order.status === "pending" && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="mt-4 w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </>
      )}

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-neutral-500">Order Items</p>
        {items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.quantity}× {item.item_name}
            </span>
            <span>₹{Number(item.subtotal).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold">
          <span>Total</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      {showReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-4xl">🎉</p>
            <h2 className="mt-2 text-xl font-semibold">Food Ready!</h2>
            <p className="mt-1 text-sm text-neutral-500">Your order {order.orderNumber} is ready for pickup.</p>
            <button
              onClick={() => setShowReady(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-2 text-sm font-medium text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showCancelled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="text-xl font-semibold text-red-600">Order Cancelled</h2>
            {order.cancellationReason && <p className="mt-2 text-sm text-neutral-600">{order.cancellationReason}</p>}
            <button
              onClick={() => setShowCancelled(false)}
              className="mt-5 w-full rounded-xl border border-neutral-300 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
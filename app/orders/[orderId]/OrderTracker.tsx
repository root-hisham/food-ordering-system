"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/types/order";
import { useTransition } from "react";
import { cancelMyOrderAction } from "./actions";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  stallName: string;
  pickupCode: string | null;
  cancellationReason: string | null;
  tableNumber: string | null;
  items: { item_name: string; quantity: number; unit_price: number; subtotal: number }[];
}

const STEPS: OrderStatus[] = ["pending", "accepted", "ready", "completed"];
const STEP_LABEL: Record<OrderStatus, string> = {
  pending: "Order Placed",
  accepted: "Accepted",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderTracker({ initialOrder }: { initialOrder: OrderDetail }) {
  const [order, setOrder] = useState(initialOrder);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      await cancelMyOrderAction(order.id);
    });
  };


  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          const newStatus = payload.new.status as OrderStatus;
          setOrder((prev) => ({ ...prev, status: newStatus }));

          if (
            newStatus === "ready" &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Food Ready! 🎉", {
              body: `Your order ${order.orderNumber} is ready for pickup.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div>
      <p className="font-mono text-xs text-neutral-400">{order.orderNumber}</p>
      <h1 className="text-xl font-semibold">{order.stallName}</h1>

      {order.status === "cancelled" ? (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">This order was cancelled.</p>
          {order.cancellationReason && <p className="mt-1">Reason: {order.cancellationReason}</p>}
        </div>
      ) : (
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
      )}

      {order.status === "ready" && (
        <p className="mt-4 rounded-xl bg-green-50 p-4 text-center font-medium text-green-700">
          🎉 Your food is ready! Please pick it up.
        </p>
      )}
      {order.pickupCode && order.status !== "completed" && order.status !== "cancelled" && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50 p-4 text-center">
          <p className="text-xs text-neutral-500">Show this code at pickup</p>
          <p className="mt-1 text-3xl font-bold tracking-widest text-pink-600">{order.pickupCode}</p>
        </div>
      )}

      {order.status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="mt-4 w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 disabled:opacity-50"
        >
          {isPending ? "Cancelling..." : "Cancel Order"}
        </button>
      )}

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-neutral-500">Order Items</p>
        {order.items.map((item, i) => (
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
    </div>
  );
}
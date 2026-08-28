"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/types/order";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  stallName: string;
  items: { item_name: string; quantity: number; unit_price: number; subtotal: number }[];
}

const STEPS: OrderStatus[] = ["pending", "accepted", "cooking", "ready", "completed"];
const STEP_LABEL: Record<OrderStatus, string> = {
  pending: "Order Placed",
  accepted: "Accepted",
  cooking: "Cooking",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderTracker({ initialOrder }: { initialOrder: OrderDetail }) {
  const [order, setOrder] = useState(initialOrder);

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
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          This order was cancelled.
        </p>
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
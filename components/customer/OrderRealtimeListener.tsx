"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notifications/sound";
import { OrderReadyPopup } from "./OrderReadyPopup";

interface ReadyOrder {
  id: string;
  orderNumber: string;
  stallName: string;
}

export function OrderRealtimeListener({ userId }: { userId: string }) {
  const router = useRouter();
  const [readyOrder, setReadyOrder] = useState<ReadyOrder | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `customer_id=eq.${userId}` },
        async (payload) => {
          const newStatus = payload.new.status as string;

          if (newStatus === "ready") {
            const { data: order } = await supabase
              .from("orders")
              .select("order_number, stalls(name)")
              .eq("id", payload.new.id)
              .single();

            setReadyOrder({
              id: payload.new.id,
              orderNumber: order?.order_number ?? "",
              stallName: (order as any)?.stalls?.name ?? "the stall",
            });

            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            playNotificationSound();

            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("Food Ready! 🎉", {
                body: `Your order ${order?.order_number ?? ""} is ready for pickup.`,
              });
            }
          }

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  if (!readyOrder) return null;

  return (
    <OrderReadyPopup
      orderNumber={readyOrder.orderNumber}
      stallName={readyOrder.stallName}
      onClose={() => setReadyOrder(null)}
      onView={() => {
        router.push(`/orders/${readyOrder.id}`);
        setReadyOrder(null);
      }}
    />
  );
}
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

          // Refreshes whatever Server Component page is currently
          // open (order list, order detail, history) — this is what
          // eliminates the need to manually reload anywhere.
          router.refresh();

          if (newStatus === "ready") {
            const { data: order } = await supabase
              .from("orders")
              .select("order_number, stalls(name)")
              .eq("id", payload.new.id)
              .single();

            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            playNotificationSound();

            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("Food Ready! 🎉", {
                body: `Your order ${order?.order_number ?? ""} is ready for pickup.`,
              });
            }

            setReadyOrder({
              id: payload.new.id,
              orderNumber: order?.order_number ?? "",
              stallName: (order as any)?.stalls?.name ?? "the stall",
            });
          }
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
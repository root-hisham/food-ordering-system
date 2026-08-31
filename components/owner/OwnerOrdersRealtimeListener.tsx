"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notifications/sound";

export function OwnerOrdersRealtimeListener({ stallId }: { stallId: string }) {
  const router = useRouter();
  const [newOrderBanner, setNewOrderBanner] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    function subscribe() {
      const channel = supabase
        .channel(`owner-orders-${stallId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `stall_id=eq.${stallId}` },
          (payload) => {
            // Leave this in during rollout — cheapest way to confirm
            // events are actually arriving before removing it.
            console.log("[realtime] orders event:", payload.eventType, payload.new ?? payload.old);

            if (payload.eventType === "INSERT") {
              playNotificationSound();
              setNewOrderBanner(true);
              setTimeout(() => setNewOrderBanner(false), 4000);
            }

            router.refresh();
          }
        )
        .subscribe((status) => {
          console.log("[realtime] owner-orders channel status:", status);
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            // Drop and retry — WS connections do occasionally die silently.
            supabase.removeChannel(channel);
            setTimeout(subscribe, 2000);
          }
        });

      return channel;
    }

    const channel = subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [stallId, router]);

  if (!newOrderBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg animate-pulse">
      🔔 New order received
    </div>
  );
}
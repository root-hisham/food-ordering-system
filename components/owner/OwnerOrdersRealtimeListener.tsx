"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OwnerOrdersRealtimeListener({ stallId }: { stallId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`owner-orders-${stallId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `stall_id=eq.${stallId}` },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stallId, router]);

  return null;
}
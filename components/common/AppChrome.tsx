"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { StickyCartBar } from "../customer/StickyCartBar";
import { OrderRealtimeListener } from "../customer/OrderRealtimeListener";
import { CartIdentityGuard } from "./CartIdentityGuard";
import { TouchRipple } from "./TouchRipple";
import { unlockAudio } from "@/lib/notifications/sound";

const HIDE_CHROME_PREFIXES = ["/admin", "/owner", "/login", "/register", "/post-login"];

export function AppChrome({
  children,
  customerId,
}: {
  children: React.ReactNode;
  customerId?: string;
}) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  if (hideChrome) {
    return (
      <>
        <CartIdentityGuard customerId={customerId} />
        <TouchRipple />
        {children}
      </>
    );
  }

  return (
    <div className="pb-16">
      <CartIdentityGuard customerId={customerId} />
      <TouchRipple />
      {children}
      {customerId && <OrderRealtimeListener userId={customerId} />}
      <StickyCartBar />
      <BottomNav />
    </div>
  );
}
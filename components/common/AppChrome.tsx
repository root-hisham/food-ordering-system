"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { StickyCartBar } from "../customer/StickyCartBar";
import { OrderRealtimeListener } from "../customer/OrderRealtimeListener";

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

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="pb-16">
      {children}
      {customerId && <OrderRealtimeListener userId={customerId} />}
      <StickyCartBar />
      <BottomNav />
    </div>
  );
}
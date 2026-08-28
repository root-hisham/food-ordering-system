"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { StickyCartBar } from "../customer/StickyCartBar";

const HIDE_CHROME_PREFIXES = ["/admin", "/owner", "/login", "/register", "/post-login"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PREFIXES.some((p) => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="pb-16">
      {children}
      <StickyCartBar />
      <BottomNav />
    </div>
  );
}
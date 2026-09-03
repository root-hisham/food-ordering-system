"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Cookies (auth session) and localStorage (this cart) are both shared by
 * every tab of the same browser — logging in as a different account in
 * another tab silently changes who the *next* request in this tab acts as.
 * Mount once near the root with the server-resolved customer id (undefined
 * for guests/owners/admins) so a stale cart never gets checked out under
 * the wrong identity.
 */
export function CartIdentityGuard({ customerId }: { customerId?: string }) {
  const syncIdentity = useCartStore((s) => s.syncIdentity);

  useEffect(() => {
    syncIdentity(customerId ?? null);
  }, [customerId, syncIdentity]);

  return null;
}

# Stall Open / Opening Soon / Closed toggle

This zip mirrors your project folder structure — extract it into your
project root and let it overwrite/merge the matching paths.

## Files
NEW:
- supabase/migrations/0011_stall_availability.sql
- types/stall.ts
- app/owner/actions.ts
- components/owner/StallAvailabilityToggle.tsx
- components/customer/StallAvailabilityBadge.tsx

MODIFIED (full replacement — these overwrite your current versions):
- services/stall.service.ts
- services/browse.service.ts
- services/customer-order.service.ts
- services/guest-order.service.ts
- app/owner/layout.tsx
- app/stall/[stallId]/page.tsx
- app/stall/[stallId]/MenuBrowser.tsx
- app/stalls/page.tsx

## Setup steps

1. Copy these files into your project (overwrite the "MODIFIED" ones).
2. Run the new migration against your Supabase project:
   ```
   supabase db push
   ```
   or paste `0011_stall_availability.sql` into the SQL editor.
3. That's it — no new RLS policy needed, no new storage bucket, no
   package installs.

## What it does

- Adds `stalls.availability` (`'open' | 'closed' | 'opening_soon'`,
  defaults `'open'`) — separate from your existing `status`
  (`'active'/'inactive'`), which is still the admin listing toggle.
- Owner section: a bigger 3-way pill toggle at the very top of every
  `/owner/*` page (lives in the layout, so it's always visible), with
  optimistic UI + rollback on error.
- Enforced server-side, not just hidden in the UI: `placeOrder`,
  `placeOrderAsCustomer`, and `placeGuestOrder` all re-check the
  stall's live status/availability before accepting an order, so a
  stale cart page can't slip an order through after the owner closes.
- Customer side: the stall's menu page still renders (view-only) when
  closed/opening-soon — the "Add" button is replaced with a label
  ("Stall closed" / "Opening soon") — plus a badge on the stall header
  and in the `/stalls` browse list so it's visible before tapping in.

## Not included (tell me if you want these too)
- A live badge that updates via Supabase Realtime while a customer is
  mid-browsing (currently it's set on page load/refresh only).
- A matching warning banner on the `/checkout` page itself — right
  now if someone reaches checkout on a since-closed stall, the order
  attempt is rejected with a clear error message, but there's no
  banner before they hit "place order".

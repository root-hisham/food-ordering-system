# Home page carousel fixes + site-wide background/animation refresh

This zip mirrors your project folder structure — extract into your project
root and let it overwrite the matching paths. No new packages, no migration.

## Files (all full replacements)
- components/customer/PopularStallsCarousel3D.tsx
- components/customer/CategoryChips.tsx
- app/page.tsx
- app/login/page.tsx
- app/register/page.tsx
- app/orders/page.tsx
- app/checkout/page.tsx
- app/history/page.tsx
- app/profile/page.tsx
- tailwind.config.ts

## What was fixed

**Swipe direction bug (mobile):** the drag offset was inverted, so
dragging left moved the carousel right and vice-versa. That sign is
now corrected so the cards follow your finger/cursor naturally.

**Swipe not working on laptop:** with a mouse, the browser's native
image-drag gesture (dragging an `<img>` starts an HTML5 drag
operation by default) was hijacking the pointer sequence before your
custom swipe logic ever saw it — that's why it worked (backwards) on
touch but did nothing with a mouse. Fixed by calling
`preventDefault()` on pointer-down and setting `draggable={false}` on
the card images, so the browser never starts its own drag.

**Card size:** cards are now `w-48` (was `w-36`), images `h-20` (was
`h-16`), and the carousel track is taller (`h-64` vs `h-56`) to fit
them. Spacing, depth, and drag sensitivity were scaled up to match so
the 3D fan still feels right at the new size.

## What was added

- **Full-page animated background** on every screen: login, register,
  home, active orders, checkout, history, and profile all now use a
  slow-shifting gradient (`animate-gradient-shift`, ~12s loop, defined
  in `tailwind.config.ts`) instead of a flat/static background. Login
  and register also get two soft blurred blobs that gently float.
- **"View All Stalls" button** below the home page carousel, linking
  to `/stalls`.
- **Site footer** below that button — small logo mark, "Food Court"
  name, and a one-line tagline.
- Removed the 🔥 emoji next to the "Popular Stalls" heading.
- Removed the 🍽️ fallback emoji used when a category or carousel
  card has no image — replaced with a matching Lucide icon
  (`Utensils` / `UtensilsCrossed`) so it stays visually consistent
  instead of relying on emoji rendering (which looks different across
  OSes/browsers anyway).

## Idea for the rest of the emojis in the project

A few functional/decorative emoji are still used elsewhere (🎉 on
order-ready celebrations, 🟢/🔴 stall status dots, 🔔 owner
notifications, the 🧡 in the homepage tagline). If you'd like those
gone too, the cleanest approach is the same one used here: swap each
for the matching Lucide icon you already have installed (e.g.
`PartyPopper` for 🎉, `Circle`/`CircleDot` for the status dots,
`Bell` for 🔔) rather than deleting them outright, so the visual
meaning (celebration, status, alert) is kept without relying on an
emoji glyph. Say the word and I'll do a pass on those too.

## Not included (tell me if you want these)
- Emoji swaps outside the ones explicitly asked about above.
- A matching animated background specifically for `/stall/[stallId]`,
  `/cart`, and the guest-checkout tracker pages — only the pages you
  listed were updated.

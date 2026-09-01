# Fix: home page "Popular Stalls" always showed Open

The home page (`app/page.tsx`) doesn't use the `/stalls` listing page
you already have the fix on — it renders through a separate
`components/customer/StallCard.tsx` component, which was hardcoding
a static "Open" badge and never even received an `availability` prop.
That's why the individual stall page correctly showed "Opening Soon"
but the home page grid still said "Open" for every stall.

## Files (both are full replacements)
- components/customer/StallCard.tsx
- app/page.tsx

Just drop these two in, overwriting what's there. No migration, no
other changes needed — `listActiveStalls()` was already returning
the right `availability` value from the last update, this just wires
it through to the card that was ignoring it.

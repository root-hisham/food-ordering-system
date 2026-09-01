# Popular Stalls — swipeable carousel

Flat/native version chosen over the exact 3D fanned-arc mockup, per
your call: pure CSS `scroll-snap` does the actual swiping (the
browser's compositor handles it — no JS runs during the swipe
itself), so it costs nothing on slower phones. A single lightweight
`IntersectionObserver` just keeps the dot indicator in sync — that's
the only JS involved.

No new npm packages. No star ratings included — your schema has no
ratings field, so I left it out rather than fake data; say the word
if you want that added as a real feature later.

## Files (both full replacements)
- components/customer/PopularStallsCarousel.tsx (NEW)
- app/page.tsx (replaces the vertical stall list in the "Popular
  Stalls" section with the carousel; everything else on the home
  page is unchanged)

Drop both in, no migration, no other changes needed.

Note: only the HOME PAGE "Popular Stalls" section became a carousel.
`/stalls` ("View all") is still the plain vertical list — that one
makes more sense as a scrollable list once someone's actively
browsing everything, but say if you'd rather that stay a grid or
change too.

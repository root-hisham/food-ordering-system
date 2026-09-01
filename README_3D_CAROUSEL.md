# Popular Stalls — 3D carousel, swipe fix + bubble styling

## The "not moving" bug
Root cause: the swipe area had no `touch-action` set, so on a real
touch screen the browser's default panning behavior can intercept
the drag before JS ever sees enough `pointermove` events to register
it as a swipe — it was fighting the browser instead of listening to
it. Fixed by setting `touch-action: pan-y` on the swipe container:
this tells the browser "don't try to handle horizontal drags
yourself, only vertical page-scroll", freeing horizontal gestures up
for the carousel's own JS to handle.

If you only tested this in desktop dev tools before, that's also
why it may have looked fine there — mouse drag doesn't go through
the same browser gesture-recognition path.

## Smoother / bubble feel
- Card settle animation now uses a "back-out" bounce easing
  (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — it overshoots slightly
  then eases back, giving that springy/bubble feel instead of a
  flat linear-ish snap. Still pure CSS `transition`, no animation
  library.
- Cards alternate between two pastel gradients (rose/pink and
  grey/slate), rounder corners (`rounded-[28px]`), a soft white ring
  around the logo, and a stronger shadow for a plusher look.
- Added a few soft blurred color "bubbles" behind the carousel
  (pink + grey, low opacity, `blur-2xl`) for atmosphere — pure CSS,
  no images, and they're `pointer-events-none` so they never
  interfere with the swipe itself.

Same performance safeguards as before (windowed rendering, GPU-only
transform/opacity properties, no new npm packages).

## Files (full replacement)
- components/customer/PopularStallsCarousel3D.tsx

`app/page.tsx` is unchanged from the previous drop — same component
name/props, so you only need to replace this one file this time.

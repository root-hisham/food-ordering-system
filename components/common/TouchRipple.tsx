"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts once in the root layout. Listens for pointerdown anywhere in the
 * app and spawns a short-lived "bubble" ripple circle at the tap/click
 * point, giving every interactive tap a soft physical feel without having
 * to wire it into every individual button.
 *
 * Uses Pointer Events so it fires for touch, mouse, and pen alike.
 */
export function TouchRipple() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Skip form fields — a ripple under a text cursor is more annoying
      // than delightful, and skip anything explicitly opted out.
      if (
        target.closest(
          'input, textarea, select, [contenteditable="true"], [data-no-ripple]'
        )
      ) {
        return;
      }

      // Only ripple over something actually interactive, so idle taps on
      // empty background don't bubble.
      const interactive = target.closest(
        'button, a, [role="button"], [data-ripple]'
      );
      if (!interactive) return;

      const bubble = document.createElement("span");
      const size = 18;
      bubble.className = "touch-ripple-bubble";
      bubble.style.left = `${e.clientX - size / 2}px`;
      bubble.style.top = `${e.clientY - size / 2}px`;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      container?.appendChild(bubble);
      bubble.addEventListener("animationend", () => bubble.remove());
      // Safety net in case animationend doesn't fire (e.g. tab backgrounded)
      setTimeout(() => bubble.remove(), 700);
    }

    document.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    />
  );
}

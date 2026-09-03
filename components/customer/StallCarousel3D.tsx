"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Stall {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
}

export function StallCarousel3D({ stalls }: { stalls: Stall[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const trackWidth = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(stalls.length - 1, i)),
    [stalls.length]
  );

  const goTo = useCallback(
    (i: number) => setActiveIndex(clampIndex(i)),
    [clampIndex]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only left click / primary touch, and don't hijack clicks on the card link itself
    if (e.button !== undefined && e.button !== 0) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    trackWidth.current = trackRef.current?.offsetWidth ?? 300;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX.current);
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = Math.min(80, trackWidth.current * 0.15);
    if (dragOffset > threshold) {
      goTo(activeIndex - 1);
    } else if (dragOffset < -threshold) {
      goTo(activeIndex + 1);
    }
    setDragOffset(0);
  };

  if (stalls.length === 0) return null;

  // Fractional offset lets the drag preview slide smoothly before snapping
  const dragFraction = trackWidth.current
    ? dragOffset / trackWidth.current
    : 0;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="stall-carousel-viewport select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="stall-carousel-track relative flex h-52 items-center justify-center">
          {stalls.map((stall, i) => {
            const offset = i - activeIndex - dragFraction;
            const abs = Math.abs(offset);

            // Cards more than ~2.5 slots away aren't worth rendering/animating
            if (abs > 2.6) return null;

            const translateX = offset * 46; // % of viewport width per slot
            const rotateY = Math.max(-45, Math.min(45, offset * -35));
            const scale = Math.max(0.72, 1 - abs * 0.16);
            const opacity = Math.max(0, 1 - abs * 0.45);
            const zIndex = 100 - Math.round(abs * 10);

            return (
              <Link
                key={stall.id}
                href={`/stall/${stall.id}`}
                data-ripple
                onClickCapture={(e) => {
                  // While dragging (or just after a drag), treat the pointerup
                  // as a swipe, not a navigation click.
                  if (Math.abs(dragOffset) > 6) e.preventDefault();
                }}
                style={{
                  transform: `translateX(-50%) translateX(${translateX}%) translateY(-50%) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isDragging
                    ? "none"
                    : "transform 380ms cubic-bezier(0.22,1,0.36,1), opacity 380ms ease",
                }}
                className="absolute left-1/2 top-1/2 flex w-40 shrink-0 flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-md"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-brand-50">
                  {stall.logoUrl ? (
                    <Image
                      src={stall.logoUrl}
                      alt={stall.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🍽️
                    </div>
                  )}
                </div>
                <p className="truncate w-full text-sm font-semibold text-neutral-900">
                  {stall.name}
                </p>
                {stall.category && (
                  <p className="truncate w-full text-xs text-neutral-500">
                    {stall.category}
                  </p>
                )}
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                  Open
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Arrow buttons — primary way to navigate with a mouse on laptop */}
      {stalls.length > 1 && (
        <>
          <button
            type="button"
            data-ripple
            aria-label="Previous stall"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-0 top-1/2 z-[200] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-600 shadow-md transition hover:bg-brand-50 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            data-ripple
            aria-label="Next stall"
            disabled={activeIndex === stalls.length - 1}
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-0 top-1/2 z-[200] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-600 shadow-md transition hover:bg-brand-50 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {stalls.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {stalls.map((s, i) => (
            <button
              key={s.id}
              type="button"
              data-ripple
              aria-label={`Go to ${s.name}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 bg-brand-600" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

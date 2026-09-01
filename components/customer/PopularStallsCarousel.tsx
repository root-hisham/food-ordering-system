"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StallAvailability } from "@/types/stall";

interface CarouselStall {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  availability: StallAvailability;
}

const BADGE_STYLES: Record<StallAvailability, string> = {
  open: "bg-green-50 text-green-700",
  opening_soon: "bg-amber-50 text-amber-700",
  closed: "bg-red-50 text-red-700",
};

const BADGE_LABEL: Record<StallAvailability, string> = {
  open: "Open",
  opening_soon: "Opening Soon",
  closed: "Closed",
};

/**
 * Native CSS scroll-snap carousel — no drag/transform JS on the
 * swipe path at all, so it stays smooth on low-end phones. A single
 * lightweight IntersectionObserver just tracks which card is
 * centered, to drive the dots and arrow-button state.
 */
export function PopularStallsCarousel({ stalls }: { stalls: CarouselStall[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { root: track, threshold: [0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [stalls.length]);

  const scrollToIndex = (idx: number) => {
    const card = cardRefs.current[idx];
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (stalls.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stalls.map((stall, i) => (
          <Link
            key={stall.id}
            href={`/stall/${stall.id}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="flex w-40 shrink-0 snap-center flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-transform duration-200 active:scale-95"
          >
            {stall.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stall.logoUrl}
                alt={stall.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-2xl">
                🍽️
              </div>
            )}
            <p className="mt-2 w-full truncate font-semibold text-neutral-900">{stall.name}</p>
            {stall.category && <p className="w-full truncate text-xs text-neutral-500">{stall.category}</p>}
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[stall.availability]}`}
            >
              {BADGE_LABEL[stall.availability]}
            </span>
          </Link>
        ))}
      </div>

      {stalls.length > 1 && (
        <>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {stalls.map((stall, i) => (
              <button
                key={stall.id}
                type="button"
                aria-label={`Go to ${stall.name}`}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-4 bg-brand-600" : "w-1.5 bg-neutral-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous stall"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="absolute left-1 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-md disabled:opacity-0 sm:flex"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next stall"
            onClick={() => scrollToIndex(Math.min(stalls.length - 1, activeIndex + 1))}
            disabled={activeIndex === stalls.length - 1}
            className="absolute right-1 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-md disabled:opacity-0 sm:flex"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

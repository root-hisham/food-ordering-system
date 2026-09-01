"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StallAvailability } from "@/types/stall";

interface CarouselStall {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  availability: StallAvailability;
}

const BADGE_STYLES: Record<StallAvailability, string> = {
  open: "bg-green-100 text-green-700",
  opening_soon: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-700",
};

const BADGE_LABEL: Record<StallAvailability, string> = {
  open: "Open",
  opening_soon: "Opening Soon",
  closed: "Closed",
};

// Alternating pastel "bubble" card backgrounds — grey/pink shades.
const CARD_SHADES = [
  "from-rose-50 to-pink-100",
  "from-neutral-100 to-slate-200",
];

const WINDOW = 3;
const ROTATE_DEG = 22;
const SPACING_PX = 78;
const DEPTH_PX = 60;
const DRAG_TO_INDEX = 90;
const SWIPE_COMMIT_PX = 40;
// Bouncy "back out" easing — overshoots slightly then settles, for
// the bubble/spring feel. Pure CSS, no animation library needed.
const BOUNCE_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export function PopularStallsCarousel3D({ stalls }: { stalls: CarouselStall[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragState = useRef<{ startX: number; dragging: boolean; moved: boolean } | null>(null);

  const clampIndex = (i: number) => Math.max(0, Math.min(stalls.length - 1, i));

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, dragging: true, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state?.dragging) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 6) state.moved = true;
    setDragOffset(-delta / DRAG_TO_INDEX);
  };

  const endDrag = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state?.dragging) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > SWIPE_COMMIT_PX) {
      setActiveIndex((prev) => clampIndex(prev + (delta < 0 ? 1 : -1)));
    }
    setDragOffset(0);
    dragState.current = { ...state, dragging: false };
  };

  const handleCardClick = (id: string) => {
    if (dragState.current?.moved) return;
    router.push(`/stall/${id}`);
  };

  const visible = useMemo(() => {
    const lo = clampIndex(activeIndex - WINDOW);
    const hi = clampIndex(activeIndex + WINDOW);
    const items = [];
    for (let i = lo; i <= hi; i++) items.push({ stall: stalls[i], index: i });
    return items;
  }, [activeIndex, stalls]);

  if (stalls.length === 0) return null;

  return (
    <div className="relative">
      {/* Soft decorative bubbles behind the carousel — pure CSS, no images */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-6 top-2 h-24 w-24 rounded-full bg-pink-200/40 blur-2xl" />
        <div className="absolute right-0 top-10 h-20 w-20 rounded-full bg-slate-300/40 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-16 w-16 rounded-full bg-rose-200/40 blur-xl" />
      </div>

      <div
        className="relative h-56 select-none overflow-hidden [perspective:1000px] [touch-action:pan-y]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {visible.map(({ stall, index }) => {
            const offset = index - activeIndex + dragOffset;
            const clampedOffset = Math.max(-WINDOW, Math.min(WINDOW, offset));
            const translateX = clampedOffset * SPACING_PX;
            const rotateY = -clampedOffset * ROTATE_DEG;
            const translateZ = -Math.abs(clampedOffset) * DEPTH_PX;
            const scale = 1 - Math.min(Math.abs(clampedOffset) * 0.1, 0.3);
            const opacity = Math.max(0, 1 - Math.abs(clampedOffset) / (WINDOW + 0.5));
            const isDragging = dragState.current?.dragging;
            const shade = CARD_SHADES[index % CARD_SHADES.length];

            return (
              <div
                key={stall.id}
                onClick={() => handleCardClick(stall.id)}
                className={`absolute left-1/2 top-1/2 w-36 cursor-pointer rounded-[28px] border border-white/60 bg-gradient-to-br ${shade} p-4 text-center shadow-lg [backface-visibility:hidden] [will-change:transform]`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transition: isDragging ? "none" : `transform 450ms ${BOUNCE_EASING}, opacity 300ms ease-out`,
                  opacity,
                  zIndex: 100 - Math.round(Math.abs(clampedOffset) * 10),
                }}
              >
                {stall.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stall.logoUrl}
                    alt={stall.name}
                    className="mx-auto h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/70 text-2xl shadow-sm">
                    🍽️
                  </div>
                )}
                <p className="mt-2 truncate font-semibold text-neutral-800">{stall.name}</p>
                {stall.category && <p className="truncate text-xs text-neutral-500">{stall.category}</p>}
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[stall.availability]}`}
                >
                  {BADGE_LABEL[stall.availability]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {stalls.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {stalls.map((stall, i) => (
            <button
              key={stall.id}
              type="button"
              aria-label={`Go to ${stall.name}`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-4 bg-pink-400" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
      <p className="mt-1 text-center text-xs text-neutral-400">Swipe to explore more stalls</p>
    </div>
  );
}

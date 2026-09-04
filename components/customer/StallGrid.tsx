import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { StallAvailability } from "@/types/stall";

interface Stall {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  availability: StallAvailability;
}

const BADGE_STYLES: Record<StallAvailability, string> = {
  open: "bg-green-500 text-white",
  opening_soon: "bg-amber-500 text-white",
  closed: "bg-neutral-500 text-white",
};

const BADGE_LABEL: Record<StallAvailability, string> = {
  open: "Open",
  opening_soon: "Opening Soon",
  closed: "Closed",
};

/**
 * Grid of simple, efficient "box" stall cards — replaces the old
 * 3D swipe carousel. Two columns on phones (where most traffic
 * lands), growing to more columns on wider laptop viewports.
 */
export function StallGrid({ stalls }: { stalls: Stall[] }) {
  if (stalls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {stalls.map((stall, i) => (
        <Link
          key={stall.id}
          href={`/stall/${stall.id}`}
          data-ripple
          style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
          className="group flex animate-fade-in-up flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
        >
          {/* Logo */}
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
            {stall.logoUrl ? (
              <Image
                src={stall.logoUrl}
                alt={stall.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl">
                🍽️
              </div>
            )}

            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${BADGE_STYLES[stall.availability]}`}
            >
              {BADGE_LABEL[stall.availability]}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-0.5 p-2.5">
            <p className="truncate text-sm font-bold text-neutral-900">{stall.name}</p>
            {stall.category && (
              <p className="truncate text-xs text-neutral-500">{stall.category}</p>
            )}

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-neutral-400">Order now</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white">
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

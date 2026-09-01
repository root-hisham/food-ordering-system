import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StallAvailability } from "@/types/stall";

interface StallCardProps {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  availability: StallAvailability;
  index?: number;
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

export function StallCard({ id, name, category, logoUrl, availability, index = 0 }: StallCardProps) {
  return (
    <Link
      href={`/stall/${id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group flex animate-fade-in-up items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={name}
          className="h-16 w-16 shrink-0 rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-2xl">
          🍽️
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-neutral-900">{name}</p>
        {category && <p className="truncate text-sm text-neutral-500">{category}</p>}
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[availability]}`}>
          {BADGE_LABEL[availability]}
        </span>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 transition-all duration-200 group-hover:bg-brand-600 group-hover:text-white">
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

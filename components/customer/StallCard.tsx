import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StallCardProps {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  index?: number;
}

export function StallCard({ id, name, category, logoUrl, index = 0 }: StallCardProps) {
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
        <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Open
        </span>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 transition-all duration-200 group-hover:bg-brand-600 group-hover:text-white">
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

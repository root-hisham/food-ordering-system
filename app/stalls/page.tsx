import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import { listActiveStalls } from "@/services/browse.service";

export default async function StallsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const stalls = await listActiveStalls(searchParams.q);

  return (
    <main className="pb-24">
      {/* Hero header — matches the home page's soft gradient shade */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 px-4 pb-8 pt-6">
        <Sparkles className="absolute right-24 top-6 h-5 w-5 animate-float text-amber-400" />
        <Sparkles
          className="absolute right-14 top-16 h-3 w-3 animate-float text-orange-400"
          style={{ animationDelay: "1s" }}
        />

        <div className="animate-fade-in">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">All Stalls</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Browse every stall in the food court <span className="inline-block">🍴</span>
          </p>
        </div>

        <form className="mt-5 animate-fade-in-up">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-neutral-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search stalls..."
              className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </div>
        </form>
      </div>

      <div className="px-4 pt-5">
        {stalls.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center">
            <p className="text-neutral-500">No stalls found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stalls.map((stall, i) => (
              <Link
                key={stall.id}
                href={`/stall/${stall.id}`}
                data-ripple
                style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
                className="group flex animate-fade-in-up gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                {stall.logo_url ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-brand-50">
                    <Image
                      src={stall.logo_url}
                      alt={stall.name}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-2xl">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">{stall.name}</p>
                  <p className="truncate text-xs text-neutral-500">{stall.category}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{stall.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

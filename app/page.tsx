import Link from "next/link";
import { Bell, SlidersHorizontal, Search, Sparkles, Store, UtensilsCrossed } from "lucide-react";
import { listActiveStalls } from "@/services/browse.service";
import { listCategories } from "@/services/category.service";
import { listActiveAnnouncements } from "@/services/announcement.service";
import { listCustomerActiveOrders } from "@/services/customer-order.service";
import { getCurrentProfile } from "@/lib/auth/session";
import { CategoryChips } from "@/components/customer/CategoryChips";
import { AnnouncementCarousel } from "@/components/customer/AnnouncementCarousel";
import { PopularStallsCarousel3D } from "@/components/customer/PopularStallsCarousel3D";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const profile = await getCurrentProfile();
  const isCustomer = profile?.role === "customer";

  const [stalls, categories, announcements, activeOrders] = await Promise.all([
    listActiveStalls(undefined, searchParams.category),
    listCategories(),
    listActiveAnnouncements(),
    isCustomer ? listCustomerActiveOrders(profile!.id) : Promise.resolve([]),
  ]);

  const hasReadyOrder = activeOrders.some((o) => o.status === "ready");
  const activeCategoryName = searchParams.category
    ? categories.find((c) => c.id === searchParams.category)?.name
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 bg-[length:200%_200%] pb-24 animate-gradient-shift">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 px-4 pb-8 pt-6">
        <Sparkles className="absolute right-24 top-6 h-5 w-5 animate-float text-amber-400" />
        <Sparkles className="absolute right-14 top-16 h-3 w-3 animate-float text-orange-400" style={{ animationDelay: "1s" }} />

        <div className="flex items-start justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Food Court</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Delicious food from your favourite stalls <span className="inline-block">🧡</span>
            </p>
          </div>

          <Link
            href="/orders"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <Bell size={20} className="text-neutral-700" />
            {hasReadyOrder && (
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>
        </div>

        <form action="/stalls" className="mt-5 flex animate-fade-in-up gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-neutral-400" />
            <input
              type="text"
              name="q"
              placeholder="Search for stalls or dishes..."
              className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </div>
          <button
            type="submit"
            className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>
      </div>

      <div className="px-4">
        {/* Category chips */}
        <div className="-mt-2 pb-2 pt-4">
          <CategoryChips categories={categories} activeCategoryId={searchParams.category} />
        </div>

        {/* Announcement carousel */}
        {announcements.length > 0 && (
          <div className="mt-4">
            <AnnouncementCarousel announcements={announcements} />
          </div>
        )}

        {/* Popular stalls */}
        <div className="mb-3 mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            {activeCategoryName ? activeCategoryName : "Popular Stalls"}
          </h2>
          <Link href="/stalls" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>

        {stalls.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center">
            <p className="text-neutral-500">
              {activeCategoryName ? `No open stalls under "${activeCategoryName}" right now.` : "No stalls open right now."}
            </p>
          </div>
        ) : (
          <>
            <PopularStallsCarousel3D
              stalls={stalls.map((s) => ({
                id: s.id,
                name: s.name,
                category: s.category,
                logoUrl: s.logo_url,
                availability: s.availability ?? "open",
              }))}
            />

            {/* List-view CTA below the swipe carousel */}
            <div className="mt-6 flex justify-center">
              <Link
                href="/stalls"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/70 transition-transform hover:scale-105 active:scale-95"
              >
                <Store size={16} />
                View All Stalls
              </Link>
            </div>
          </>
        )}

        {/* Site footer */}
        <footer className="mt-10 border-t border-orange-200/50 pt-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <UtensilsCrossed size={19} className="text-brand-600" />
          </div>
          <p className="text-sm font-semibold text-neutral-700">Food Court</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-neutral-400">
            Fresh meals, made to order, from every stall under one roof.
          </p>
        </footer>
      </div>
    </main>
  );
}

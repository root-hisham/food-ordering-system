import type { Metadata } from "next";
import Link from "next/link";
import { listActiveStalls } from "@/services/browse.service";
import { StallAvailabilityBadge } from "@/components/customer/StallAvailabilityBadge";

export const metadata: Metadata = {
  title: "Food Stalls",
  description:
    "Browse active food stalls, discover menus, and find delicious food on Bonanza Hub.",

  alternates: {
    canonical: "/stalls",
  },

  openGraph: {
    title: "Food Stalls | Bonanza Hub",
    description:
      "Browse active food stalls and discover their menus on Bonanza Hub.",
    url: "https://www.bonanzahub.site/stalls",
    siteName: "Bonanza Hub",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function StallsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const stalls = await listActiveStalls(searchParams.q);

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="mb-4 text-2xl font-semibold">
        All Stalls
      </h1>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search stalls..."
          className="w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
      </form>

      {stalls.length === 0 ? (
        <p className="text-neutral-500">
          No stalls found.
        </p>
      ) : (
        <div className="space-y-3">
          {stalls.map((stall) => (
            <Link
              key={stall.id}
              href={`/stall/${stall.id}`}
              className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3"
            >
              {stall.logo_url ? (
                <img
                  src={stall.logo_url}
                  alt={stall.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-neutral-100" />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {stall.name}
                  </p>

                  <StallAvailabilityBadge
                    availability={
                      stall.availability ?? "open"
                    }
                  />
                </div>

                <p className="text-xs text-neutral-500">
                  {stall.category}
                </p>

                <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                  {stall.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
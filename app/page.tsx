import Link from "next/link";
import { listActiveStalls } from "@/services/browse.service";

export default async function HomePage() {
  const stalls = await listActiveStalls();

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="text-2xl font-semibold">Food Court</h1>
      <p className="mt-1 text-sm text-neutral-500">Order from any stall — pay at the counter.</p>

      <Link
        href="/stalls"
        className="mt-4 block rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-500"
      >
        Search all stalls →
      </Link>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-neutral-500">Stalls</h2>
      {stalls.length === 0 ? (
        <p className="text-neutral-500">No stalls open right now.</p>
      ) : (
        <div className="space-y-3">
          {stalls.map((stall) => (
            <Link
              key={stall.id}
              href={`/stall/${stall.id}`}
              className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3"
            >
              {stall.logo_url ? (
                <img src={stall.logo_url} alt={stall.name} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-neutral-100" />
              )}
              <div>
                <p className="font-medium">{stall.name}</p>
                <p className="text-xs text-neutral-500">{stall.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
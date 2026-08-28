import { notFound } from "next/navigation";
import { getStallWithMenu } from "@/services/browse.service";
import { MenuBrowser } from "./MenuBrowser";

export default async function StallMenuPage({ params }: { params: { stallId: string } }) {
  const data = await getStallWithMenu(params.stallId);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <div className="mb-6 flex gap-3">
        {data.stall.logo_url ? (
          <img src={data.stall.logo_url} alt={data.stall.name} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-neutral-100" />
        )}
        <div>
          <h1 className="text-xl font-semibold">{data.stall.name}</h1>
          <p className="text-sm text-neutral-500">{data.stall.category}</p>
          <p className="text-xs text-neutral-400">{data.stall.description}</p>
          {data.stall.status !== "active" && (
            <p className="mt-1 text-xs font-medium text-red-600">Currently closed</p>
          )}
        </div>
      </div>

      <MenuBrowser
        stallId={data.stall.id}
        stallName={data.stall.name}
        stallActive={data.stall.status === "active"}
        categories={data.categories}
        items={data.items}
      />
    </main>
  );
}
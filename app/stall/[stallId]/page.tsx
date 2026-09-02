import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStallWithMenu } from "@/services/browse.service";
import { MenuBrowser } from "./MenuBrowser";
import { StallAvailabilityBadge } from "@/components/customer/StallAvailabilityBadge";

const siteUrl = "https://www.bonanzahub.site";

export async function generateMetadata({
  params,
}: {
  params: { stallId: string };
}): Promise<Metadata> {
  const data = await getStallWithMenu(params.stallId);

  if (!data) {
    return {
      title: "Stall Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const stall = data.stall;

  const title = `${stall.name} Menu`;

  const description =
    stall.description?.trim() ||
    `Explore the menu at ${stall.name} on Bonanza Hub.`;

  const canonicalUrl =
    `${siteUrl}/stall/${stall.id}`;

  return {
    title,

    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "Bonanza Hub",
      title,
      description,

      ...(stall.logo_url
        ? {
            images: [
              {
                url: stall.logo_url,
                alt: `${stall.name} logo`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(stall.logo_url
        ? {
            images: [stall.logo_url],
          }
        : {}),
    },

    robots:
      stall.status === "active"
        ? {
            index: true,
            follow: true,
          }
        : {
            index: false,
            follow: false,
          },
  };
}

export default async function StallMenuPage({
  params,
}: {
  params: { stallId: string };
}) {
  const data = await getStallWithMenu(params.stallId);

  if (!data) {
    notFound();
  }

  const availability =
    data.stall.availability ?? "open";

  const canOrder =
    data.stall.status === "active" &&
    availability === "open";

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <div className="mb-6 flex gap-3">
        {data.stall.logo_url ? (
          <img
            src={data.stall.logo_url}
            alt={data.stall.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-neutral-100" />
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {data.stall.name}
            </h1>

            {data.stall.status === "active" && (
              <StallAvailabilityBadge
                availability={availability}
              />
            )}
          </div>

          <p className="text-sm text-neutral-500">
            {data.stall.category}
          </p>

          <p className="text-xs text-neutral-400">
            {data.stall.description}
          </p>

          {data.stall.status !== "active" && (
            <p className="mt-1 text-xs font-medium text-red-600">
              Currently closed
            </p>
          )}
        </div>
      </div>

      <MenuBrowser
        stallId={data.stall.id}
        stallName={data.stall.name}
        canOrder={canOrder}
        availability={availability}
        categories={data.categories}
        items={data.items}
      />
    </main>
  );
}
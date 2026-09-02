import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://www.bonanzahub.site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stalls, error } = await supabase
    .from("stalls")
    .select("id, created_at")
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Sitemap: failed to load stalls:", error);
  }

  const stallUrls: MetadataRoute.Sitemap = (stalls ?? []).map((stall) => ({
    url: `${siteUrl}/stall/${stall.id}`,
    lastModified: stall.created_at
      ? new Date(stall.created_at)
      : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${siteUrl}/stalls`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    ...stallUrls,
  ];
}
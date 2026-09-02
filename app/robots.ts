import type { MetadataRoute } from "next";

const siteUrl = "https://www.bonanzahub.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      allow: "/",

      disallow: [
        "/admin",
        "/owner",
        "/login",
        "/register",
        "/post-login",
        "/cart",
        "/checkout",
        "/history",
        "/orders",
        "/profile",
        "/auth",
        "/api",
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
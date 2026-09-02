import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/common/AppChrome";
import { getCurrentProfile } from "@/lib/auth/session";

const siteUrl = "https://www.bonanzahub.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Bonanza Hub",
    template: "%s | Bonanza Hub",
  },

  description:
    "Bonanza Hub - Discover food stalls, explore menus, and order delicious food online.",

  applicationName: "Bonanza Hub",

  keywords: [
    "Bonanza Hub",
    "food court",
    "food stalls",
    "food ordering",
    "online food ordering",
    "restaurants",
    "food menu",
  ],

  authors: [
    {
      name: "Bonanza Hub",
    },
  ],

  creator: "Bonanza Hub",
  publisher: "Bonanza Hub",

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Bonanza Hub",
    title: "Bonanza Hub",
    description:
      "Discover food stalls, explore menus, and order delicious food from Bonanza Hub.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bonanza Hub",
    description:
      "Discover food stalls, explore menus, and order delicious food from Bonanza Hub.",
  },

  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  const customerId =
    profile?.role === "customer" ? profile.id : undefined;

  return (
    <html lang="en">
      <body>
        <AppChrome customerId={customerId}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
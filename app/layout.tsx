import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/common/AppChrome";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Food Court",
  description: "Order food from your favorite stalls",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const customerId = profile?.role === "customer" ? profile.id : undefined;

  return (
    <html lang="en">
      <body>
        <AppChrome customerId={customerId}>{children}</AppChrome>
      </body>
    </html>
  );
}
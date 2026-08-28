import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/common/AppChrome";

export const metadata: Metadata = {
  title: "Food Court",
  description: "Order food from your favorite stalls",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
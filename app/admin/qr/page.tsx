import { QrCodeManager } from "./QrCodeManager";

export default function AdminQrPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">QR Code</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Print this and place it on tables or at the entrance. Scanning it opens the customer
        ordering page directly — never the admin or owner panel.
      </p>
      <QrCodeManager siteUrl={siteUrl} />
    </div>
  );
}
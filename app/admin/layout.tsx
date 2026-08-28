import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { SignOutButton } from "@/components/common/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin"]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Admin</p>
          <p className="font-semibold">{profile.full_name}</p>
        </div>
        <SignOutButton />
      </header>
      <nav className="flex flex-wrap gap-4 border-b border-neutral-200 bg-white px-6 py-2 text-sm">
        <Link href="/admin" className="font-medium text-neutral-600 hover:text-brand-600">Dashboard</Link>
        <Link href="/admin/stalls" className="font-medium text-neutral-600 hover:text-brand-600">Stalls</Link>
        <Link href="/admin/customers" className="font-medium text-neutral-600 hover:text-brand-600">Customers</Link>
        <Link href="/admin/orders" className="font-medium text-neutral-600 hover:text-brand-600">Orders</Link>
        <Link href="/admin/qr" className="font-medium text-neutral-600 hover:text-brand-600">QR Code</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
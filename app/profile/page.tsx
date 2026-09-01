import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { SignOutButton } from "@/components/common/SignOutButton";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/profile");

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 bg-[length:200%_200%] animate-gradient-shift">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        <h1 className="mb-6 text-xl font-semibold">Profile</h1>

        <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <p className="font-medium">{profile.full_name}</p>
          <p className="text-sm text-neutral-500">{profile.mobile_number}</p>
        </div>

        <div className="mt-4 space-y-2">
          <a href="/history" className="block rounded-xl border border-neutral-200 bg-white/90 p-4 text-sm font-medium shadow-sm backdrop-blur">
            Order History
          </a>
          <a href="/orders" className="block rounded-xl border border-neutral-200 bg-white/90 p-4 text-sm font-medium shadow-sm backdrop-blur">
            Active Orders
          </a>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}

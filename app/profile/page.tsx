import { redirect } from "next/navigation";
import { getCurrentProfile, homeRouteForRole } from "@/lib/auth/session";
import { SignOutButton } from "@/components/common/SignOutButton";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/profile");
  if (profile.role !== "customer") redirect(homeRouteForRole(profile.role));

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="mb-6 text-xl font-semibold">Profile</h1>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-medium">{profile.full_name}</p>
        <p className="text-sm text-neutral-500">{profile.mobile_number}</p>
      </div>

      <div className="mt-4 space-y-2">
        <a href="/history" className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm font-medium">
          Order History
        </a>
        <a href="/orders" className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm font-medium">
          Active Orders
        </a>
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
    >
      Sign out
    </button>
  );
}
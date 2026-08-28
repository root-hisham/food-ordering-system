import { redirect } from "next/navigation";
import { getCurrentProfile, homeRouteForRole } from "@/lib/auth/session";

export default async function PostLoginPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  redirect(homeRouteForRole(profile.role));
}
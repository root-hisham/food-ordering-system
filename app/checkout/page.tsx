import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/checkout");
  }
  if (profile.role !== "customer") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-24">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
      <CheckoutForm />
    </main>
  );
}
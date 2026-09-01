import { getCurrentProfile } from "@/lib/auth/session";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();
  const isCustomer = profile?.role === "customer";

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 bg-[length:200%_200%] animate-gradient-shift">
      <div className="mx-auto max-w-md px-4 py-6 pb-24">
        <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
        <CheckoutForm
          isLoggedIn={isCustomer}
          defaultName={isCustomer ? profile!.full_name : ""}
          defaultMobile={isCustomer ? profile!.mobile_number ?? "" : ""}
        />
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCustomer, type RegisterState } from "./actions";

const initialState: RegisterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Creating account..." : "Create Account"}
    </button>
  );
}

export default function RegisterPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const [state, formAction] = useFormState(registerCustomer, initialState);
  const router = useRouter();
  const redirectTo = searchParams.redirect;

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo || "/post-login");
      router.refresh();
    }
  }, [state.success, router, redirectTo]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-neutral-500">
        For customers only — browsing doesn&apos;t require an account, but placing an order does.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input name="fullName" type="text" required className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mobile number</label>
          <input
            name="mobileNumber"
            type="tel"
            required
            pattern="\d{10}"
            title="10-digit mobile number"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-brand-500"
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          className="font-medium text-brand-600"
        >
          Log in
        </Link>
      </p>
    </main>
  );
}
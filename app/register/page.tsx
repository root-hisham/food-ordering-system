"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerCustomer, type RegisterState } from "./actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const initialState: RegisterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-3 font-medium text-white shadow-md shadow-pink-200 transition hover:from-pink-600 hover:to-orange-600 disabled:opacity-60"
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-neutral-100 to-neutral-200 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-pink-100 bg-white/90 p-8 shadow-xl shadow-pink-100 backdrop-blur">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-800">Create your account</h1>

        <GoogleSignInButton redirectTo={redirectTo} />

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-600">Full name</label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full rounded-xl border border-pink-200 bg-neutral-50 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-600">Mobile number</label>
            <input
              name="mobileNumber"
              type="tel"
              required
              pattern="\d{10}"
              title="10-digit mobile number"
              className="w-full rounded-xl border border-pink-200 bg-neutral-50 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              placeholder=""
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-600">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-pink-200 bg-neutral-50 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-medium text-pink-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
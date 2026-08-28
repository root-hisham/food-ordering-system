"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Logging in..." : "Log In"}
    </button>
  );
}

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const [state, formAction] = useFormState(login, initialState);
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
      <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Customers: log in with your mobile number. Owners &amp; admins: use your email.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Mobile number or email</label>
          <input
            name="identifier"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-brand-500"
            placeholder="9876543210 or you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New customer?{" "}
        <Link
          href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
          className="font-medium text-brand-600"
        >
          Create an account
        </Link>
      </p>
    </main>
  );
}
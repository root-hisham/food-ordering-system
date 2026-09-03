"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login, type LoginState } from "./actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-3 font-medium text-white shadow-md shadow-pink-200 transition hover:from-pink-600 hover:to-orange-600 disabled:opacity-60"
    >
      {pending ? "Logging in..." : "Log In"}
    </button>
  );
}

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string; error?: string } }) {
  const [state, formAction] = useFormState(login, initialState);
  const redirectTo = searchParams.redirect;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-neutral-100 to-neutral-200 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-pink-100 bg-white/90 p-8 shadow-xl shadow-pink-100 backdrop-blur">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-800">Welcome back</h1>

        <GoogleSignInButton redirectTo={redirectTo} />

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-600">Mobile number</label>
            <input
              name="identifier"
              type="text"
              required
              autoComplete="username"
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-pink-200 bg-neutral-50 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New customer?{" "}
          <Link
            href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="font-medium text-pink-600"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
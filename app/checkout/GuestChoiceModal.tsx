"use client";

import Link from "next/link";

export function GuestChoiceModal({
  onContinueAsGuest,
  onClose,
}: {
  onContinueAsGuest: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-neutral-800">How would you like to order?</h2>
        <p className="mt-1 text-sm text-neutral-500">
          You can order without an account, or log in to track your order history.
        </p>

        <div className="mt-5 space-y-2">
          <button
            onClick={onContinueAsGuest}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 py-3 text-sm font-medium text-white"
          >
            Continue as Guest
          </button>
          <Link
            href="/login?redirect=/checkout"
            className="block w-full rounded-xl border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-700"
          >
            Log In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="block w-full rounded-xl border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-700"
          >
            Create Account
          </Link>
        </div>

        <button onClick={onClose} className="mt-4 w-full text-center text-xs text-neutral-400">
          Cancel
        </button>
      </div>
    </div>
  );
}
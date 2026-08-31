"use client";

import { useState } from "react";

export function CompleteOrderModal({
  onConfirm,
  onClose,
  submitting,
  error,
}: {
  onConfirm: (code: string) => void;
  onClose: () => void;
  submitting: boolean;
  error?: string;
}) {
  const [code, setCode] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Confirm pickup</h2>
        <p className="mt-1 text-sm text-neutral-500">Ask the customer for their 4-digit pickup code.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          placeholder="0000"
          className="mt-4 w-full rounded-xl border border-neutral-300 px-4 py-3 text-center text-2xl tracking-widest"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-300 py-2 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(code)}
            disabled={code.length !== 4 || submitting}
            className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Checking..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
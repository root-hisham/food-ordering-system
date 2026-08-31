"use client";

import { useState } from "react";

export function CancelOrderModal({
  onConfirm,
  onClose,
  submitting,
}: {
  onConfirm: (reason: string) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Cancel order</h2>
        <p className="mt-1 text-sm text-neutral-500">Let the customer know why — this is shown to them.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Item out of stock"
          className="mt-4 w-full rounded-xl border border-neutral-300 px-4 py-3"
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-neutral-300 py-2 text-sm font-medium">
            Back
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || submitting}
            className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
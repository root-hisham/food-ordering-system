"use client";

import { useTransition } from "react";
import { revokeSessionAction } from "./actions";

export function RevokeSessionButton({ stallId, sessionId }: { stallId: string; sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Sign this device out immediately?")) {
          startTransition(() => revokeSessionAction(stallId, sessionId));
        }
      }}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}
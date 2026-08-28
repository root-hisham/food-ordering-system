"use client";

import { useTransition } from "react";
import { toggleStallStatusAction } from "./actions";

export function ToggleStallStatusButton({
  stallId,
  status,
}: {
  stallId: string;
  status: "active" | "inactive";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleStallStatusAction(stallId, status))}
      className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      {status === "active" ? "Deactivate" : "Activate"}
    </button>
  );
}
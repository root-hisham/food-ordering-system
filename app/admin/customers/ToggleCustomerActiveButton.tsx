"use client";

import { useTransition } from "react";
import { toggleCustomerActiveAction } from "./actions";

export function ToggleCustomerActiveButton({
  customerId,
  isActive,
}: {
  customerId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleCustomerActiveAction(customerId, isActive))}
      className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
"use client";

import { useTransition } from "react";
import { advanceOrderStatusAction, cancelOrderAction } from "./actions";
import type { OrderStatus } from "@/types/order";

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: "Accept Order",
  cooking: "Start Cooking",
  ready: "Mark Ready",
  completed: "Complete",
};

export function OrderActionButtons({
  orderId,
  status,
  nextStatus,
}: {
  orderId: string;
  status: OrderStatus;
  nextStatus: OrderStatus | null;
}) {
  const [isPending, startTransition] = useTransition();
  const canCancel = status === "pending" || status === "accepted" || status === "cooking";

  if (status === "completed" || status === "cancelled") {
    return <p className="text-xs text-neutral-400">No further actions</p>;
  }

  return (
    <div className="flex gap-2">
      {nextStatus && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void advanceOrderStatusAction(orderId, nextStatus);
            })
          }
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {ACTION_LABEL[nextStatus]}
        </button>
      )}
      {canCancel && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void cancelOrderAction(orderId);
            })
          }
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
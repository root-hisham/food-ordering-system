"use client";

import { useState, useTransition } from "react";
import { advanceOrderStatusAction, cancelOrderAction, completeOrderAction } from "./actions";
import { CompleteOrderModal } from "@/components/owner/CompleteOrderModal";
import { CancelOrderModal } from "@/components/owner/CancelOrderModal";
import type { OrderStatus } from "@/types/order";

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: "Accept Order",
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
  const [showComplete, setShowComplete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const canCancel = status === "pending" || status === "accepted";

  if (status === "completed" || status === "cancelled") {
    return <p className="text-xs text-neutral-400">No further actions</p>;
  }

  const handleNext = () => {
    if (!nextStatus) return;
    if (nextStatus === "completed") {
      setShowComplete(true);
      return;
    }
    startTransition(() => {
      void advanceOrderStatusAction(orderId, nextStatus);
    });
  };

  const handleCompleteConfirm = (code: string) => {
    setCompleteError("");
    startTransition(async () => {
      const result = await completeOrderAction(orderId, code);
      if (result.error) {
        setCompleteError(result.error);
        return;
      }
      setShowComplete(false);
    });
  };

  const handleCancelConfirm = (reason: string) => {
    startTransition(async () => {
      await cancelOrderAction(orderId, reason);
      setShowCancel(false);
    });
  };

  return (
    <>
      <div className="flex gap-2">
        {nextStatus && (
          <button
            disabled={isPending}
            onClick={handleNext}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {ACTION_LABEL[nextStatus]}
          </button>
        )}
        {canCancel && (
          <button
            disabled={isPending}
            onClick={() => setShowCancel(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {showComplete && (
        <CompleteOrderModal
          onConfirm={handleCompleteConfirm}
          onClose={() => setShowComplete(false)}
          submitting={isPending}
          error={completeError}
        />
      )}
      {showCancel && (
        <CancelOrderModal onConfirm={handleCancelConfirm} onClose={() => setShowCancel(false)} submitting={isPending} />
      )}
    </>
  );
}
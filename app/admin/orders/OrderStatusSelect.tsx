"use client";

import { useTransition } from "react";
import { overrideOrderStatusAction } from "./actions";
import { ALL_STATUSES, type OrderStatus } from "@/types/order";

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => overrideOrderStatusAction(orderId, e.target.value as OrderStatus))
      }
      className="rounded-lg border border-neutral-300 px-2 py-1 text-xs capitalize"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </select>
  );
}
"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toggleMenuItemAvailabilityAction, deleteMenuItemAction } from "./actions";

export function MenuItemRow({ item }: { item: any }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      {item.image_url ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-cover" />
        </div>
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100" />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">
              {item.name} <span className="text-xs text-neutral-400">{item.is_veg ? "🟢" : "🔴"}</span>
            </p>
            <p className="text-xs text-neutral-500">{item.categoryName}</p>
          </div>
          <p className="font-semibold">₹{Number(item.price).toFixed(2)}</p>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <Link href={`/owner/menu/${item.id}/edit`} data-ripple className="font-medium text-brand-600 hover:text-brand-700">
            Edit
          </Link>
          <button
            data-ripple
            disabled={isPending}
            onClick={() => startTransition(() => toggleMenuItemAvailabilityAction(item.id, item.is_available))}
            className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {item.is_available ? "Mark Unavailable" : "Mark Available"}
          </button>
          <button
            data-ripple
            disabled={isPending}
            onClick={() => startTransition(() => deleteMenuItemAction(item.id))}
            className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        {!item.is_available && (
          <p className="mt-1 text-xs font-medium text-neutral-400">Currently Unavailable</p>
        )}
      </div>
    </div>
  );
}
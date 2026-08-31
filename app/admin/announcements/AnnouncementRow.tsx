"use client";

import { useTransition } from "react";
import { toggleAnnouncementAction, deleteAnnouncementAction } from "./actions";
import type { Announcement } from "@/types/announcement";

export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={announcement.image_url} alt="" className="h-14 w-24 rounded-lg object-cover" />
      <div className="flex-1">
        <p className="font-medium">{announcement.title || "Untitled banner"}</p>
        {announcement.subtitle && <p className="text-xs text-neutral-500">{announcement.subtitle}</p>}
        <p className="text-xs text-neutral-400">Order {announcement.sort_order}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleAnnouncementAction(announcement.id, announcement.is_active))
          }
          className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
            announcement.is_active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {announcement.is_active ? "Live" : "Hidden"}
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteAnnouncementAction(announcement.id))}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

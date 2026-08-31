"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Announcement } from "@/types/announcement";

export function AnnouncementCarousel({ announcements }: { announcements: Announcement[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (announcements.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {announcements.map((a) => {
          const content = (
            <div className="relative h-40 w-full shrink-0 sm:h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.image_url} alt={a.title ?? ""} className="h-full w-full object-cover" />
              {(a.title || a.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/50 via-black/10 to-transparent p-6 text-white">
                  {a.title && <p className="text-lg font-bold">{a.title}</p>}
                  {a.subtitle && <p className="mt-1 text-sm">{a.subtitle}</p>}
                </div>
              )}
            </div>
          );

          return a.link_url ? (
            <Link key={a.id} href={a.link_url} className="w-full shrink-0">
              {content}
            </Link>
          ) : (
            <div key={a.id} className="w-full shrink-0">
              {content}
            </div>
          );
        })}
      </div>

      {announcements.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {announcements.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

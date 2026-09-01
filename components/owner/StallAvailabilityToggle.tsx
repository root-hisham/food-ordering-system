"use client";

import { useState, useTransition } from "react";
import { setStallAvailabilityAction } from "@/app/owner/actions";
import type { StallAvailability } from "@/types/stall";

const OPTIONS: { value: StallAvailability; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "opening_soon", label: "Opening Soon" },
  { value: "closed", label: "Closed" },
];

const ACTIVE_STYLES: Record<StallAvailability, string> = {
  open: "bg-green-500 text-white",
  opening_soon: "bg-amber-400 text-white",
  closed: "bg-red-500 text-white",
};

export function StallAvailabilityToggle({ initial }: { initial: StallAvailability }) {
  const [value, setValue] = useState<StallAvailability>(initial);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: StallAvailability) => {
    if (next === value || isPending) return;
    const prev = value;
    setValue(next); // optimistic
    setError("");
    startTransition(async () => {
      const result = await setStallAvailabilityAction(next);
      if (result?.error) {
        setValue(prev); // roll back
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Stall availability"
        className="flex w-full max-w-md items-center gap-1 rounded-full border-2 border-neutral-200 bg-neutral-100 p-1 shadow-sm sm:w-auto"
      >
        {OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isPending}
              onClick={() => handleSelect(opt.value)}
              className={`flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-70 sm:flex-none sm:px-5 ${
                isActive ? ACTIVE_STYLES[opt.value] : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

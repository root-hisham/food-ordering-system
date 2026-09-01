import type { StallAvailability } from "@/types/stall";

const STYLES: Record<StallAvailability, string> = {
  open: "bg-green-100 text-green-700",
  opening_soon: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-700",
};

const LABEL: Record<StallAvailability, string> = {
  open: "Open",
  opening_soon: "Opening Soon",
  closed: "Closed",
};

/**
 * Small pill used anywhere a customer sees a stall — the browse
 * list, the chip-filtered home sections, and the stall's own menu
 * page — so "closed" is visible before and after tapping in.
 */
export function StallAvailabilityBadge({ availability }: { availability: StallAvailability }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[availability]}`}>
      {LABEL[availability]}
    </span>
  );
}

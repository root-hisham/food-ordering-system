export type StallAvailability = "open" | "closed" | "opening_soon";

export const STALL_AVAILABILITY_LABEL: Record<StallAvailability, string> = {
  open: "Open",
  opening_soon: "Opening Soon",
  closed: "Closed",
};

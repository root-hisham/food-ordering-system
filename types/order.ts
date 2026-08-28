export type OrderStatus =
  | "pending"
  | "accepted"
  | "cooking"
  | "ready"
  | "completed"
  | "cancelled";

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "cooking",
  "ready",
  "completed",
  "cancelled",
];
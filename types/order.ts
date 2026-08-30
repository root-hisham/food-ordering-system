export type OrderStatus =
  | "pending"
  | "accepted"
  | "ready"
  | "completed"
  | "cancelled";

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "ready",
  "completed",
  "cancelled",
];
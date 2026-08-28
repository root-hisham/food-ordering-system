export type UserRole = "admin" | "stall_owner" | "customer";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  mobile_number: string | null;
  created_at?: string;
}
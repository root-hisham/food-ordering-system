import { z } from "zod";

export const createStallSchema = z.object({
  stallName: z.string().min(2, "Stall name is too short"),
  category: z.string().min(1, "Enter a category"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  ownerName: z.string().min(2, "Owner name is too short"),
  ownerMobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  ownerEmail: z.string().email("Enter a valid email"),
  ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateStallInput = z.infer<typeof createStallSchema>;

export const updateStallSchema = z.object({
  stallName: z.string().min(2, "Stall name is too short"),
  category: z.string().min(1, "Enter a category"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateStallInput = z.infer<typeof updateStallSchema>;
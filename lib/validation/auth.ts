import { z } from "zod";

export const customerRegisterSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your mobile number or email"),
  password: z.string().min(1, "Password is required"),
});
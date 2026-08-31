import { z } from "zod";

export const createAnnouncementSchema = z.object({
  imageUrl: z.string().url("Upload a banner image first"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  linkUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

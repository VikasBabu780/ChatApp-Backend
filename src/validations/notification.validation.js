import { z } from "zod";

export const notificationIdSchema = z.object({
  notificationId: z
    .string()
    .trim()
    .min(1, "Notification ID is required."),
});
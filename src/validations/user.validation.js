import { z } from "zod";


export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(50).optional(),

  bio: z.string().max(150).optional().or(z.literal("")),

  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
    .optional()
    .or(z.literal("")),
});


export const changeUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username cannot exceed 20 characters.")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscore (_) and dot (.)"
    )
    .transform((value) => value.toLowerCase()),
});


export const updatePrivacySettingsSchema = z.object({
  friendRequestPermission: z
  .enum([
    "EVERYONE",
    "NOBODY",
  ])
  .optional(),
  messagePermission: z
    .enum([
      "EVERYONE",
      "FRIENDS_ONLY",
      "NOBODY",
    ])
    .optional(),

    groupInvitePermission: z
  .enum([
    "EVERYONE",
    "FRIENDS_ONLY",
    "NOBODY",
  ])
  .optional(),

  showLastSeen: z
    .boolean()
    .optional(),

  showOnlineStatus: z
    .boolean()
    .optional(),

  readReceipts: z
    .boolean()
    .optional(),

  showTypingIndicator: z
    .boolean()
    .optional(),
});

export const searchUsersSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1)
    .optional(),

  page: z.coerce
    .number()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .min(1)
    .max(50)
    .default(10),
});
import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  receiverId: z
    .string()
    .trim()
    .min(1, "Receiver ID is required."),
});


export const cancelFriendRequestSchema = z.object({
  requestId: z
    .string()
    .trim()
    .min(1, "Friend request ID is required."),
});

export const acceptFriendRequestSchema = z.object({
  requestId: z
    .string()
    .trim()
    .min(1, "Friend request ID is required."),
});


export const rejectFriendRequestSchema = z.object({
  requestId: z
    .string()
    .trim()
    .min(1, "Friend request ID is required."),
});

export const removeFriendSchema = z.object({
  friendId: z
    .string()
    .trim()
    .min(1, "Friend ID is required."),
});

export const getFriendSuggestionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(50).default(20),
});
import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine(
    (value) => mongoose.Types.ObjectId.isValid(value),
    {
      message: "Invalid ObjectId.",
    }
  );

// Create/Get Private Chat
export const createPrivateChatSchema = z.object({
  userId: objectIdSchema,
});

// Create Group Chat
export const createGroupChatSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(100),

  participants: z
    .array(objectIdSchema)
    .min(2)
    .max(500),

  description: z
    .string()
    .max(300)
    .optional(),
});

// Update Group
export const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .optional(),

  description: z
    .string()
    .max(300)
    .optional(),
});

// Chat Id Param
export const chatIdSchema = z.object({
  chatId: objectIdSchema,
});
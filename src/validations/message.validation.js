import { z } from "zod";
import mongoose from "mongoose";
import { MESSAGE_TYPES } from "../constants/chat.constants.js";

const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId.",
  });

// Send Message
export const sendMessageSchema = z
  .object({
    chatId: objectIdSchema,

    type: z.enum(Object.values(MESSAGE_TYPES)),

    content: z.string().trim().max(5000).optional(),

    replyTo: objectIdSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === MESSAGE_TYPES.TEXT &&
      (!data.content || !data.content.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Text message content is required.",
      });
    }
  });

// Edit Message
export const editMessageSchema = z.object({

    messageId: objectIdSchema,

    content: z
        .string()
        .trim()
        .min(1)
        .max(5000)

});

// Delete Message
export const deleteForMeSchema = z.object({
  messageId: objectIdSchema,
});


export const deleteForEveryoneSchema = z.object({
  messageId: objectIdSchema,
});


export const getMessagesSchema = z.object({
  chatId: objectIdSchema,

  page: z.coerce
    .number()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(30),
});
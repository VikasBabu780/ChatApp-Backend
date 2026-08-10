import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (value) => mongoose.Types.ObjectId.isValid(value),
  {
    message: "Invalid ID.",
  }
);

export const addReactionValidation = z.object({
  params: z.object({
    messageId: objectId,
  }),

  body: z.object({
    emoji: z
      .string()
      .trim()
      .min(1, "Emoji is required.")
      .max(10, "Invalid emoji."),
  }),
});

export const removeReactionValidation = z.object({
  params: z.object({
    messageId: objectId,
  }),
});
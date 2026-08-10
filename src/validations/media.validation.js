import mongoose from "mongoose";
import { z } from "zod";

const objectId = z.string().refine(
  (value) =>
    mongoose.Types.ObjectId.isValid(value),
  {
    message: "Invalid ID.",
  }
);

const mediaTypes = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
];

export const sendMediaMessageValidation =
  z.object({
    body: z.object({
      chatId: objectId,

      type: z.enum(mediaTypes, {
        message:
          "Type must be IMAGE, VIDEO, AUDIO or DOCUMENT.",
      }),

      content: z
        .string()
        .trim()
        .max(
          5000,
          "Content cannot exceed 5000 characters."
        )
        .optional()
        .default(""),

      replyTo: objectId.optional(),
    }),
  });
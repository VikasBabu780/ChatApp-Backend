import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (value) => mongoose.Types.ObjectId.isValid(value),
  {
    message: "Invalid ID.",
  }
);

/**
 * =========================================================
 * FORWARD MESSAGE VALIDATION
 * =========================================================
 *
 * Body:
 * {
 *   "messageId": "...",
 *   "chatId": "..."
 * }
 */

export const forwardMessageValidation = z.object({
  body: z.object({
    messageId: objectId,

    chatId: objectId,
  }),
});
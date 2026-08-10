import { z } from "zod";
import mongoose from "mongoose";

/**
 * =========================================================
 * OBJECT ID VALIDATOR
 * =========================================================
 */

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ID.",
  });

/**
 * =========================================================
 * PIN MESSAGE
 * =========================================================
 *
 * Body:
 * {
 *   "messageId": "MESSAGE_ID"
 * }
 */

export const pinMessageValidation = z.object({
  body: z.object({
    messageId: objectId,
  }),
});

/**
 * =========================================================
 * UNPIN MESSAGE
 * =========================================================
 *
 * Params:
 * /:messageId
 */

export const unpinMessageValidation = z.object({
  params: z.object({
    messageId: objectId,
  }),
});

/**
 * =========================================================
 * GET PINNED MESSAGES
 * =========================================================
 *
 * Params:
 * /:chatId
 */

export const getPinnedMessagesValidation = z.object({
  params: z.object({
    chatId: objectId,
  }),
});

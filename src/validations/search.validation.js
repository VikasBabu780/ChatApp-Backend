import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ID.",
  });

const pagination = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
};

export const searchUsersValidation = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(2, "Search must contain at least 2 characters.")
      .max(100, "Search query is too long."),

    ...pagination,
  }),
});

export const searchChatsValidation = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(2, "Search must contain at least 2 characters.")
      .max(100, "Search query is too long."),

    ...pagination,
  }),
});

export const searchMessagesValidation = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(2, "Search must contain at least 2 characters.")
      .max(100, "Search query is too long."),

    chatId: objectId.optional(),

    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

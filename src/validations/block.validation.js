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
    message: "Invalid user ID.",
  });

/**
 * =========================================================
 * BLOCK USER
 * =========================================================
 *
 * POST /api/v1/users/block/:userId
 */

export const blockUserValidation = z.object({
  params: z.object({
    userId: objectId,
  }),
});

/**
 * =========================================================
 * UNBLOCK USER
 * =========================================================
 *
 * DELETE /api/v1/users/block/:userId
 */

export const unblockUserValidation = z.object({
  params: z.object({
    userId: objectId,
  }),
});

/**
 * =========================================================
 * GET BLOCK STATUS
 * =========================================================
 *
 * GET /api/v1/users/block/:userId/status
 */

export const getBlockStatusValidation = z.object({
  params: z.object({
    userId: objectId,
  }),
});

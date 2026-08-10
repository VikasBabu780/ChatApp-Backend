import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ID.",
  });

/**
 * Create Group
 */
export const createGroupValidation = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Group name is required.")
      .max(100, "Group name cannot exceed 100 characters."),

    description: z
      .string()
      .trim()
      .max(300, "Description cannot exceed 300 characters.")
      .optional()
      .default(""),

    memberIds: z.array(objectId).min(1, "At least one member is required."),
  }),
});

/**
 * Group ID
 */
export const groupIdValidation = z.object({
  params: z.object({
    groupId: objectId,
  }),
});

/**
 * Add Members
 */
export const addGroupMembersValidation = z.object({
  params: z.object({
    groupId: objectId,
  }),

  body: z.object({
    memberIds: z.array(objectId).min(1, "At least one member is required."),
  }),
});

/**
 * Remove Member
 */
export const removeGroupMemberValidation = z.object({
  params: z.object({
    groupId: objectId,
    memberId: objectId,
  }),
});

/**
 * Make Admin
 */
export const makeGroupAdminValidation = z.object({
  params: z.object({
    groupId: objectId,
    memberId: objectId,
  }),
});

/**
 * Remove Admin
 */
export const removeGroupAdminValidation = z.object({
  params: z.object({
    groupId: objectId,
    memberId: objectId,
  }),
});

/**
 * Update Group
 */
export const updateGroupValidation = z.object({
  params: z.object({
    groupId: objectId,
  }),

  body: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),

      description: z.string().trim().max(300).optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: "At least one field is required.",
      },
    ),
});

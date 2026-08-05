import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  updateProfileSchema,
  changeUsernameSchema,
  updatePrivacySettingsSchema,
  searchUsersSchema,
} from "../validations/user.validation.js";
import {
  updateProfile,
  uploadCoverImage,
  uploadAvatar,
  changeUsername,
  updatePrivacySettings,
  searchUsers,
} from "../services/user.service.js";

export const updateProfileController = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = updateProfileSchema.parse(req.body);

  // Update profile
  const result = await updateProfile(req.user._id, validatedData);

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const uploadAvatarController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("Avatar image is required.");
  }

  const { message, data } = await uploadAvatar(req.user._id, req.file.path);

  return res.status(200).json(new ApiResponse(200, message, data));
});

export const uploadCoverImageController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("Cover image is required.");
  }

  const { message, data } = await uploadCoverImage(req.user._id, req.file.path);

  return res.status(200).json(new ApiResponse(200, message, data));
});

export const changeUsernameController = asyncHandler(async (req, res) => {
  const { username } = changeUsernameSchema.parse(req.body);

  const result = await changeUsername(req.user._id, username);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const updatePrivacySettingsController = asyncHandler(
  async (req, res) => {
    const validatedData = updatePrivacySettingsSchema.parse(req.body);

    const result = await updatePrivacySettings(req.user._id, validatedData);

    return res
      .status(200)
      .json(new ApiResponse(200, result.message, result.data));
  },
);

export const searchUsersController = asyncHandler(async (req, res) => {
  const { q, page, limit } = searchUsersSchema.parse(req.query);

  const result = await searchUsers(req.user._id, q, page, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import RESERVED_USERNAMES from "../constants/reservedUsernames.js";

export const updateProfile = async (
  userId,
  {
    fullName,
    bio,
    mobileNumber,
  }

) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (mobileNumber !== undefined) {
    // Optional: prevent duplicate mobile numbers
    if (mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber });

      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new Error("Mobile number is already in use.");
      }
    }

    user.mobileNumber = mobileNumber;
  }

  await user.save();

  return {
    message: "Profile updated successfully.",
    data: user,
  };
};

export const uploadAvatar = async (userId, filePath) => {
  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Bypass Cloudinary for local development
  const uploadedAvatar = {
    public_id: "local_avatar_" + Date.now(),
    secure_url: filePath,
  };

  // Store old avatar id
  const oldPublicId = user.avatar?.public_id;

  // Update avatar
  user.avatar = {
    public_id: uploadedAvatar.public_id,
    url: uploadedAvatar.secure_url,
  };

  await user.save();

  // Delete old avatar (don't fail request if deletion fails)
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error("Failed to delete old avatar:", error.message);
    }
  }

  return {
    message: "Avatar updated successfully.",
    data: user,
  };
};



export const uploadCoverImage = async (userId, filePath) => {
  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Bypass Cloudinary for local development
  const uploadedCover = {
    public_id: "local_cover_" + Date.now(),
    secure_url: filePath,
  };

  // Store old cover image public id
  const oldPublicId = user.coverImage?.public_id;

  // Update cover image
  user.coverImage = {
    public_id: uploadedCover.public_id,
    url: uploadedCover.secure_url,
  };

  await user.save();

  // Delete previous cover image
  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (error) {
      console.error("Failed to delete old cover image:", error.message);
    }
  }

  return {
    message: "Cover image updated successfully.",
    data: user,
  };
};



export const changeUsername = async (userId, username) => {
  // Find current user
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Normalize username
  username = username.toLowerCase().trim();

  // Username already exists
  const existingUser = await User.findOne({
    username,
    _id: { $ne: userId },
  });

  if (existingUser) {
    throw new Error("Username is already taken.");
  }

  // Reserved usernames
  if (RESERVED_USERNAMES.includes(username)) {
    throw new Error("This username is reserved.");
  }

  // Same username
  if (user.username === username) {
    throw new Error("You are already using this username.");
  }

  // Username change cooldown (30 days)
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  if (user.usernameLastChangedAt) {
    const nextChange =
      user.usernameLastChangedAt.getTime() + THIRTY_DAYS;

    if (Date.now() < nextChange) {
      const remainingDays = Math.ceil(
        (nextChange - Date.now()) / (1000 * 60 * 60 * 24)
      );

      throw new Error(
        `You can change your username again after ${remainingDays} day(s).`
      );
    }
  }

  // Update username
  user.username = username;
  user.usernameLastChangedAt = new Date();

  await user.save();

  return {
    message: "Username updated successfully.",
    data: {
      username: user.username,
      usernameLastChangedAt: user.usernameLastChangedAt,
    },
  };
};


// services/user.service.js


export const updatePrivacySettings = async (userId, privacyData) => {
  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const {
    friendRequestPermission,
    messagePermission,
    showLastSeen,
    showOnlineStatus,
    readReceipts,
    showTypingIndicator,
    groupInvitePermission,
    
  } = privacyData;

  // Update only provided fields
  if (messagePermission !== undefined) {
    user.privacy.messagePermission = messagePermission;
  }

  if (showLastSeen !== undefined) {
    user.privacy.showLastSeen = showLastSeen;
  }

  if (showOnlineStatus !== undefined) {
    user.privacy.showOnlineStatus = showOnlineStatus;
  }

  if (readReceipts !== undefined) {
    user.privacy.readReceipts = readReceipts;
  }

  if (showTypingIndicator !== undefined) {
    user.privacy.showTypingIndicator = showTypingIndicator;
  }

  if (friendRequestPermission !== undefined) {
  user.privacy.friendRequestPermission =
    friendRequestPermission;
}

if (groupInvitePermission !== undefined) {
  user.privacy.groupInvitePermission = groupInvitePermission;
}

  await user.save();

  return {
    message: "Privacy settings updated successfully.",
    data: user.privacy,
  };
};


// services/user.service.js

export const searchUsers = async (
  currentUserId,
  searchQuery = "",
  page = 1,
  limit = 10
) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  // Build search filter
  const filter = {
    _id: { $ne: currentUserId },
    isDeleted: false,
  };

  if (searchQuery) {
    filter.$or = [
      {
        username: {
          $regex: searchQuery,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: searchQuery,
          $options: "i",
        },
      },
    ];
  }

  // Fetch users
  const users = await User.find(filter)
    .select(
      "publicId username fullName avatar isOnline bio"
    )
    .sort({ username: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Count total documents
  const totalUsers = await User.countDocuments(filter);

  return {
    message: "Users fetched successfully.",
    data: {
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNextPage: page * limit < totalUsers,
        hasPreviousPage: page > 1,
      },
    },
  };
};
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import resetPasswordEmail from "../templates/resetPasswordEmail.js";

import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import PendingRegistration from "../models/PendingRegistration.js";

import generateOTP from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

import otpEmail from "../templates/otpEmail.js";

export const registerUser = async ({ fullName, username, email, password, mobileNumber, avatar }) => {
  // Check existing user

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const errorField = existingUser.email === email ? "email" : "username";
    const errorMessage = existingUser.email === email 
      ? "Email is already registered." 
      : "Username is already taken.";
      
    throw new ApiError(400, "Please correct the following errors.", [
      { field: errorField, message: errorMessage }
    ]);
  }

  // Remove previous pending registration

  await PendingRegistration.deleteOne({ email });

  // Hash password

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP

  const otp = generateOTP();
  console.log(`\n\n========================================`);
  console.log(`🔑 DEVELOPMENT OTP CODE: ${otp}`);
  console.log(`========================================\n\n`);

  // Save pending registration

  await PendingRegistration.create({
    fullName,
    username,
    email,
    mobileNumber,
    avatar,
    password: hashedPassword,
    otp,
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendEmail({
      to: email,
      subject: "Verify your ConvoSphere account",
      html: otpEmail(fullName, otp),
    });
  } catch (error) {
    console.error("SMTP ERROR:", error.message || error);
    throw new ApiError(500, "Failed to send OTP email. Please check your connection or try again later.");
  }

  return {
    message: "OTP sent successfully",
    data: {
      email,
    },
  };
};

export const verifyOTP = async ({ email, otp }) => {
  // Find pending registration

  const pendingUser = await PendingRegistration.findOne({ email }).select(
    "+otp +password +mobileNumber +avatar"
  );

  if (!pendingUser) {
    throw new Error("Registration request not found");
  }

  // Check OTP expiry

  if (pendingUser.otpExpiry < new Date()) {
    throw new Error("OTP has expired");
  }

  // Check OTP

  if (pendingUser.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Create actual user

  const user = await User.create({
    fullName: pendingUser.fullName,
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    mobileNumber: pendingUser.mobileNumber,
    avatar: pendingUser.avatar ? { url: pendingUser.avatar } : undefined,
    isVerified: true,
  });

  // Delete pending registration

  await PendingRegistration.deleteOne({
    _id: pendingUser._id,
  });

  return {
    message: "Account verified successfully",
    data: {
      id: user.publicId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    },
  };
};

export const loginUser = async ({ identifier, password }) => {
  // Find user by email or username
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check account verification
  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your account first");
  }

  // Compare password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: "Login successful",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshToken: 1,
    },
  });

  return {
    message: "Logout successful",
  };
};


export const forgotPassword = async ({ email }) => {
  // Find user
  const user = await User.findOne({ email }).select(
    "+passwordResetToken +passwordResetExpiry"
  );

  if (!user) {
    throw new Error("No account found with this email.");
  }

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save hashed token & expiry
  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  // Create reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  console.log(`\n\n========================================`);
  console.log(`🔗 DEVELOPMENT RESET LINK:\n${resetLink}`);
  console.log(`========================================\n\n`);

  // Send email
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your ConvoSphere password",
      html: resetPasswordEmail(user.fullName, resetLink),
    });
  } catch (err) {
    console.error("Failed to send email, but continuing in dev mode. Reset Link is:", resetLink);
  }

  return {
    message: "Password reset link sent successfully.",
  };
};


export const resetPassword = async ({ token, password }) => {
  // Hash received token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find matching user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  }).select("+passwordResetToken +password");

  if (!user) {
    throw new Error("Invalid or expired reset link.");
  }

  // Update password
  user.password = password;

  // Clear reset fields
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;

  await user.save();

  return {
    message: "Password reset successfully.",
  };
};
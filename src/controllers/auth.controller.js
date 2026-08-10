import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { registerSchema ,verifyOTPSchema ,loginSchema,forgotPasswordSchema,resetPasswordSchema} from "../validations/auth.validation.js";
import { registerUser,verifyOTP ,loginUser,logoutUser,forgotPassword,resetPassword} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // If avatar uploaded, use its path. Else generate ui-avatars URL.
  if (req.file) {
    validatedData.avatar = req.file.path;
  }

  // Call service
  const result = await registerUser(validatedData);

  // Send response
  return res.status(201).json(
    new ApiResponse(
      201,
      result.message,
      result.data
    )
  );
});

export const verifyOTPController = asyncHandler(async (req, res) => {

  const validatedData = verifyOTPSchema.parse(req.body);

  const result = await verifyOTP(validatedData);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );
});


export const login = asyncHandler(async (req, res) => {

  // Validate request
  const validatedData = loginSchema.parse(req.body);

  // Login service
  const result = await loginUser(validatedData);

  const { user, accessToken, refreshToken } = result.data;

  // Set secure cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove sensitive fields
  user.password = undefined;
  user.refreshToken = undefined;
  user.accessToken = undefined;

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      {
        user,
      }
    )
  );
});


export const getCurrentUser = asyncHandler(async (req, res) => {

  return res.status(200).json(
    new ApiResponse(
      200,
      "Current user fetched successfully",
      req.user
    )
  );

});


export const logout = asyncHandler(async (req, res) => {

  await logoutUser(req.user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Logout successful",
      null
    )
  );
});


export const forgotPasswordController = asyncHandler(async (req, res) => {
  const validatedData = forgotPasswordSchema.parse(req.body);

  const result = await forgotPassword(validatedData);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
});


export const resetPasswordController = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const validatedData = resetPasswordSchema.parse(req.body);

  const result = await resetPassword({
    token,
    password: validatedData.password,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
});
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  // Get token from cookie or Authorization header
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  // Verify JWT
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // Fetch user
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpiry",
  );

  if (!user || user.isDeleted) {
    throw new ApiError(401, "Invalid access token.");
  }

  // Attach user to request
  req.user = user;

  next();
});

export default isAuthenticated;

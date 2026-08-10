import jwt from "jsonwebtoken";

import User from "../models/User.js";

/**
 * Socket.IO Authentication Middleware
 */
const socketAuth = async (socket, next) => {
  try {
    // Read token from handshake auth, headers, or cookies
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");
      
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.accessToken;
    }

    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!user || user.isDeleted) {
      return next(new Error("User not found."));
    }

    // Attach user to socket
    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Authentication failed."));
  }
};

export default socketAuth;

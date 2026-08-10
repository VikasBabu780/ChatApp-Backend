import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import groupRoutes from "./routes/group.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import searchRoutes from "./routes/search.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import forwardRoutes from "./routes/forward.routes.js";
import pinRoutes from "./routes/pin.routes.js";
import blockRoutes from "./routes/block.routes.js";
import archiveRoutes from "./routes/archive.routes.js";
import muteRoutes from "./routes/mute.routes.js";
import pinchatRoutes from "./routes/pinchat.routes.js";

import errorHandler from "./middlewares/error.js";

const app = express();

// ================================
// GLOBAL MIDDLEWARES
// ================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static("public"));

// ================================
// CORS
// ================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-frontend-ochre-sigma.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================================
// HEALTH CHECK
// ================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ConvoSphere API",
  });
});

// ================================
// API ROUTES
// ================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/friends", friendRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/reactions", reactionRoutes);
app.use("/api/v1/message/forward", forwardRoutes);
app.use("/api/v1/message/pin", pinRoutes);
app.use("/api/v1/users/block", blockRoutes);
app.use("/api/v1/archive", archiveRoutes);
app.use("/api/v1/mute", muteRoutes);
app.use("/api/v1/pin-chat", pinchatRoutes);

// ================================
// GLOBAL ERROR HANDLER
// ================================

app.use(errorHandler);

export default app;
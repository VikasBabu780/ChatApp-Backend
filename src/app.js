import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import errorHandler from "./middlewares/error.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ConvoSphere API",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/friends", friendRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(errorHandler);

export default app;

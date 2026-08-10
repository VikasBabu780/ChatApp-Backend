import express from "express";
import {
  register,
  verifyOTPController,
  login,
  getCurrentUser,
  logout,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";
import verifyJWT from "../middlewares/verifyJWT.js";

import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/verify-otp", verifyOTPController);
router.post("/login", login);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logout);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

export default router;

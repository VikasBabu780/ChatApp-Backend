import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";

import upload from "../middlewares/multer.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import { sendMediaMessageController } from "../controllers/media.controller.js";

import { sendMediaMessageValidation } from "../validations/media.validation.js";

const router = Router();

/**
 * Send media message
 *
 * POST
 * /api/v1/media/message
 */
router.post(
  "/message",

  // Authentication
  isAuthenticated,

  // File upload
  upload.single("file"),

  // Validate body
  validate(sendMediaMessageValidation),

  // Controller
  sendMediaMessageController,
);

export default router;

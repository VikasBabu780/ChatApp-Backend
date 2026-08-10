import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { forwardMessageController } from "../controllers/forward.controller.js";

import { forwardMessageValidation } from "../validations/forward.validation.js";

const router = Router();

/**
 * =========================================================
 * FORWARD MESSAGE
 * =========================================================
 *
 * POST /api/v1/message/forward
 *
 * Body:
 *
 * {
 *   "messageId": "MESSAGE_ID",
 *   "chatId": "DESTINATION_CHAT_ID"
 * }
 */

router.post(
  "/",
  isAuthenticated,
  validate(forwardMessageValidation),
  forwardMessageController,
);

export default router;

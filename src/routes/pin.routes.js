import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  pinMessageController,
  unpinMessageController,
  getPinnedMessagesController,
} from "../controllers/pin.controller.js";

import {
  pinMessageValidation,
  unpinMessageValidation,
  getPinnedMessagesValidation,
} from "../validations/pin.validation.js";

const router = Router();

/**
 * =========================================================
 * PIN MESSAGE
 * =========================================================
 *
 * POST /api/v1/message/pin
 *
 * Body:
 * {
 *   "messageId": "MESSAGE_ID"
 * }
 */

router.post(
  "/",
  isAuthenticated,
  validate(pinMessageValidation),
  pinMessageController,
);

/**
 * =========================================================
 * UNPIN MESSAGE
 * =========================================================
 *
 * DELETE /api/v1/message/pin/:messageId
 */

router.delete(
  "/:messageId",
  isAuthenticated,
  validate(unpinMessageValidation),
  unpinMessageController,
);

/**
 * =========================================================
 * GET PINNED MESSAGES
 * =========================================================
 *
 * GET /api/v1/message/pin/:chatId
 */

router.get(
  "/:chatId",
  isAuthenticated,
  validate(getPinnedMessagesValidation),
  getPinnedMessagesController,
);

export default router;

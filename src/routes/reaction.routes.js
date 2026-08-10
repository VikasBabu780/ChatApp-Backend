import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  getAvailableReactionsController,
  addReactionController,
  removeReactionController,
  getMessageReactionsController,
} from "../controllers/reaction.controller.js";

import {
  addReactionValidation,
  removeReactionValidation,
} from "../validations/reaction.validation.js";

const router = Router();

/**
 * =========================================================
 * GET AVAILABLE REACTIONS
 * =========================================================
 *
 * GET /api/v1/reactions/available
 *
 * Returns the reactions supported by the backend.
 */

router.get("/available", isAuthenticated, getAvailableReactionsController);

/**
 * =========================================================
 * ADD / CHANGE REACTION
 * =========================================================
 *
 * POST /api/v1/reactions/:messageId
 *
 * Body:
 * {
 *   "emoji": "👍"
 * }
 */

router.post(
  "/:messageId",
  isAuthenticated,
  validate(addReactionValidation),
  addReactionController,
);

/**
 * =========================================================
 * REMOVE REACTION
 * =========================================================
 *
 * DELETE /api/v1/reactions/:messageId
 */

router.delete(
  "/:messageId",
  isAuthenticated,
  validate(removeReactionValidation),
  removeReactionController,
);

/**
 * =========================================================
 * GET MESSAGE REACTIONS
 * =========================================================
 *
 * GET /api/v1/reactions/:messageId
 */

router.get(
  "/:messageId",
  isAuthenticated,
  validate(removeReactionValidation),
  getMessageReactionsController,
);

export default router;

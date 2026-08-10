import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  blockUserController,
  unblockUserController,
  getBlockedUsersController,
  getBlockStatusController,
} from "../controllers/block.controller.js";

import {
  blockUserValidation,
  unblockUserValidation,
  getBlockStatusValidation,
} from "../validations/block.validation.js";

const router = Router();

/**
 * =========================================================
 * BLOCK USER
 * =========================================================
 *
 * POST /api/v1/users/block/:userId
 */

router.post(
  "/:userId",
  isAuthenticated,
  validate(blockUserValidation),
  blockUserController,
);

/**
 * =========================================================
 * UNBLOCK USER
 * =========================================================
 *
 * DELETE /api/v1/users/block/:userId
 */

router.delete(
  "/:userId",
  isAuthenticated,
  validate(unblockUserValidation),
  unblockUserController,
);

/**
 * =========================================================
 * GET BLOCKED USERS
 * =========================================================
 *
 * GET /api/v1/users/blocked
 */

router.get("/blocked", isAuthenticated, getBlockedUsersController);

/**
 * =========================================================
 * GET BLOCK STATUS
 * =========================================================
 *
 * GET /api/v1/users/block/:userId/status
 */

router.get(
  "/:userId/status",
  isAuthenticated,
  validate(getBlockStatusValidation),
  getBlockStatusController,
);

export default router;

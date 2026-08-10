import express from "express";

import {
  muteChatController,
  unmuteChatController,
  getMutedChatsController,
  getMuteStatusController,
} from "../controllers/mute.controller.js";

import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * =========================================================
 * GET MUTED CHATS
 * =========================================================
 *
 * GET /api/v1/mute
 */

router.get("/", isAuthenticated, getMutedChatsController);

/**
 * =========================================================
 * MUTE CHAT
 * =========================================================
 *
 * POST /api/v1/mute
 */

router.post("/", isAuthenticated, muteChatController);

/**
 * =========================================================
 * UNMUTE CHAT
 * =========================================================
 *
 * DELETE /api/v1/mute
 */

router.delete("/", isAuthenticated, unmuteChatController);

/**
 * =========================================================
 * GET MUTE STATUS
 * =========================================================
 *
 * GET /api/v1/mute/:chatId
 */

router.get("/:chatId", isAuthenticated, getMuteStatusController);

export default router;

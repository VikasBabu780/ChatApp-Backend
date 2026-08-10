import express from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";

import {
  sendMessageController,
  getMessagesController,
  editMessageController,
  deleteMessageForMeController,
  deleteMessageForEveryoneController,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, sendMessageController);
router.get("/:chatId", isAuthenticated, getMessagesController);
router.patch("/:messageId", isAuthenticated, editMessageController);
router.delete("/:messageId/me", isAuthenticated, deleteMessageForMeController);
router.delete(
  "/:messageId/everyone",
  isAuthenticated,
  deleteMessageForEveryoneController,
);

export default router;

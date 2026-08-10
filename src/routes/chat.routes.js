import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  createPrivateChatController,
  getMyChatsController,
  getChatByIdController,
  deleteChatController,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/private", isAuthenticated, createPrivateChatController);
router.get("/", isAuthenticated, getMyChatsController);
router.get("/:chatId", isAuthenticated, getChatByIdController);
router.delete("/:chatId", isAuthenticated, deleteChatController);

export default router;

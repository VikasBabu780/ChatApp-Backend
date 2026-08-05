import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";

import {
  sendFriendRequestController,
  cancelFriendRequestController,
  acceptFriendRequestController,
  rejectFriendRequestController,
  getIncomingFriendRequestsController,
  getSentFriendRequestsController,
  getFriendsController,
  removeFriendController,
  getFriendSuggestionsController,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/send", verifyJWT, sendFriendRequestController);
router.patch("/cancel/:requestId", verifyJWT, cancelFriendRequestController);
router.patch("/accept/:requestId", verifyJWT, acceptFriendRequestController);
router.patch("/reject/:requestId", verifyJWT, rejectFriendRequestController);
router.get("/incoming", verifyJWT, getIncomingFriendRequestsController);
router.get("/sent", verifyJWT, getSentFriendRequestsController);
router.get("/list", verifyJWT, getFriendsController);
router.delete("/remove/:friendId", verifyJWT, removeFriendController);
router.get("/suggestions", verifyJWT, getFriendSuggestionsController);

export default router;

import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createGroupController,
  getGroupController,
  addGroupMembersController,
  removeGroupMemberController,
  leaveGroupController,
  makeGroupAdminController,
  removeGroupAdminController,
  updateGroupController,
} from "../controllers/group.controller.js";

import {
  createGroupValidation,
  groupIdValidation,
  addGroupMembersValidation,
  removeGroupMemberValidation,
  makeGroupAdminValidation,
  removeGroupAdminValidation,
  updateGroupValidation,
} from "../validations/group.validation.js";

const router = Router();

/**
 * Create group
 */
router.post(
  "/",
  isAuthenticated,
  validate(createGroupValidation),
  createGroupController,
);

/**
 * Get group
 */
router.get(
  "/:groupId",
  isAuthenticated,
  validate(groupIdValidation),
  getGroupController,
);

/**
 * Add members
 */
router.post(
  "/:groupId/members",
  isAuthenticated,
  validate(addGroupMembersValidation),
  addGroupMembersController,
);

/**
 * Remove member
 */
router.delete(
  "/:groupId/members/:memberId",
  isAuthenticated,
  validate(removeGroupMemberValidation),
  removeGroupMemberController,
);

/**
 * Leave group
 */
router.post(
  "/:groupId/leave",
  isAuthenticated,
  validate(groupIdValidation),
  leaveGroupController,
);

/**
 * Make admin
 */
router.patch(
  "/:groupId/admins/:memberId",
  isAuthenticated,
  validate(makeGroupAdminValidation),
  makeGroupAdminController,
);

/**
 * Remove admin
 */
router.delete(
  "/:groupId/admins/:memberId",
  isAuthenticated,
  validate(removeGroupAdminValidation),
  removeGroupAdminController,
);

/**
 * Update group
 */
router.patch(
  "/:groupId",
  isAuthenticated,
  validate(updateGroupValidation),
  updateGroupController,
);

export default router;

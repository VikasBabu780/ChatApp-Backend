import {
  createGroup,
  getGroupById,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
  makeGroupAdmin,
  removeGroupAdmin,
  updateGroup,
} from "../services/group.service.js";

export const createGroupController = async (req, res, next) => {
  try {
    const result = await createGroup(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupController = async (req, res, next) => {
  try {
    const result = await getGroupById(req.user._id, req.params.groupId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const addGroupMembersController = async (req, res, next) => {
  try {
    const result = await addGroupMembers(
      req.user._id,
      req.params.groupId,
      req.body.memberIds,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeGroupMemberController = async (req, res, next) => {
  try {
    const result = await removeGroupMember(
      req.user._id,
      req.params.groupId,
      req.params.memberId,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveGroupController = async (req, res, next) => {
  try {
    const result = await leaveGroup(req.user._id, req.params.groupId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const makeGroupAdminController = async (req, res, next) => {
  try {
    const result = await makeGroupAdmin(
      req.user._id,
      req.params.groupId,
      req.params.memberId,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeGroupAdminController = async (req, res, next) => {
  try {
    const result = await removeGroupAdmin(
      req.user._id,
      req.params.groupId,
      req.params.memberId,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroupController = async (req, res, next) => {
  try {
    const result = await updateGroup(
      req.user._id,
      req.params.groupId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

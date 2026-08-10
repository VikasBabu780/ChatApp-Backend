import { sendMediaMessage } from "../services/media.service.js";

export const sendMediaMessageController = async (req, res, next) => {
  try {
    const result = await sendMediaMessage(req.user._id, req.body, req.file);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

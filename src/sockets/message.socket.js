import {
  sendMessage,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  markMessageAsDelivered,
  markChatAsRead,
} from "../services/message.service.js";
import { forwardMessage } from "../services/forward.service.js";
import { pinMessage, unpinMessage } from "../services/pin.service.js";

import { addReaction, removeReaction } from "../services/reaction.service.js";

const registerMessageEvents = (io, socket) => {
  /**
   * ================================================
   * SEND MESSAGE
   * ================================================
   */

  socket.on("message:send", async (payload) => {
    try {
      if (!payload) {
        socket.emit("message:error", {
          message: "Message data is required.",
        });

        return;
      }

      const result = await sendMessage(socket.user._id, payload);

      const message = result.data;
      const room = `chat:${payload.chatId}`;

      // Notify everyone in the chat
      io.to(room).emit("message:new", {
        message,
      });

      // Confirm to sender
      socket.emit("message:sent", {
        message,
      });

      console.log(`${socket.user.username} sent a message in ${room}`);
    } catch (error) {
      console.error("Message Send Error:", error.message);

      socket.emit("message:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * EDIT MESSAGE
   * ================================================
   */

  socket.on("message:edit", async ({ messageId, content }) => {
    try {
      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required.",
        });

        return;
      }

      if (!content || !content.trim()) {
        socket.emit("message:error", {
          message: "Message content is required.",
        });

        return;
      }

      const result = await editMessage(
        socket.user._id,
        messageId,
        content.trim(),
      );

      const message = result.data;
      const room = `chat:${message.chat}`;

      // Notify everyone in chat
      io.to(room).emit("message:edited", {
        message,
      });

      // Confirm to sender
      socket.emit("message:edit-success", {
        message,
      });

      console.log(`${socket.user.username} edited message ${messageId}`);
    } catch (error) {
      console.error("Message Edit Error:", error.message);

      socket.emit("message:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * DELETE MESSAGE FOR ME
   * ================================================
   */

  socket.on("message:delete-for-me", async ({ messageId }) => {
    try {
      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required.",
        });

        return;
      }

      await deleteMessageForMe(socket.user._id, messageId);

      /*
       * This deletion is private.
       *
       * Only the current user receives
       * the deletion event.
       */

      socket.emit("message:deleted-for-me", {
        messageId,
      });

      console.log(
        `${socket.user.username} deleted message ${messageId} for themselves`,
      );
    } catch (error) {
      console.error("Delete Message For Me Error:", error.message);

      socket.emit("message:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * DELETE MESSAGE FOR EVERYONE
   * ================================================
   */

  socket.on("message:delete-for-everyone", async ({ messageId }) => {
    try {
      if (!messageId) {
        socket.emit("message:error", {
          message: "Message ID is required.",
        });

        return;
      }

      /*
       * We need the chat ID before deletion
       * so that we know which Socket.IO room
       * should receive the event.
       */

      const Message = (await import("../models/Message.js")).default;

      const messageBeforeDelete =
        await Message.findById(messageId).select("chat");

      if (!messageBeforeDelete) {
        socket.emit("message:error", {
          message: "Message not found.",
        });

        return;
      }

      const chatId = messageBeforeDelete.chat.toString();

      await deleteMessageForEveryone(socket.user._id, messageId);

      const room = `chat:${chatId}`;

      /*
       * Tell everyone in the chat that
       * the message was deleted.
       */

      io.to(room).emit("message:deleted-for-everyone", {
        messageId,
      });

      console.log(
        `${socket.user.username} deleted message ${messageId} for everyone`,
      );
    } catch (error) {
      console.error("Delete Message For Everyone Error:", error.message);

      socket.emit("message:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * ADD / CHANGE REACTION
   * ================================================
   */

  socket.on("message:reaction:add", async ({ messageId, emoji } = {}) => {
    try {
      if (!messageId) {
        socket.emit("message:reaction:error", {
          message: "Message ID is required.",
        });

        return;
      }

      if (!emoji) {
        socket.emit("message:reaction:error", {
          message: "Emoji is required.",
        });

        return;
      }

      const result = await addReaction(socket.user._id, messageId, emoji);

      const message = result.data;

      const room = `chat:${message.chat}`;

      /*
       * Broadcast updated reactions
       * to everyone in the chat.
       */

      io.to(room).emit("message:reaction:updated", {
        messageId: message._id,

        reactions: message.reactions,
      });

      console.log(
        `${socket.user.username} reacted ${emoji} to message ${messageId}`,
      );
    } catch (error) {
      console.error("Reaction Add Error:", error.message);

      socket.emit("message:reaction:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * REMOVE REACTION
   * ================================================
   */

  socket.on("message:reaction:remove", async ({ messageId } = {}) => {
    try {
      if (!messageId) {
        socket.emit("message:reaction:error", {
          message: "Message ID is required.",
        });

        return;
      }

      const result = await removeReaction(socket.user._id, messageId);

      const message = result.data;

      const room = `chat:${message.chat}`;

      /*
       * Broadcast updated reaction
       * state to everyone.
       */

      io.to(room).emit("message:reaction:updated", {
        messageId: message._id,

        reactions: message.reactions,
      });

      console.log(
        `${socket.user.username} removed reaction from message ${messageId}`,
      );
    } catch (error) {
      console.error("Reaction Remove Error:", error.message);

      socket.emit("message:reaction:error", {
        message: error.message,
      });
    }
  });

  /**
   * ================================================
   * FORWARD MESSAGE
   * ================================================
   */

  socket.on("message:forward", async ({ messageId, chatId } = {}) => {
    try {
      // Validate message ID
      if (!messageId) {
        socket.emit("message:forward:error", {
          message: "Message ID is required.",
        });

        return;
      }

      // Validate destination chat ID
      if (!chatId) {
        socket.emit("message:forward:error", {
          message: "Destination chat ID is required.",
        });

        return;
      }

      // Forward message
      const result = await forwardMessage(socket.user._id, messageId, chatId);

      const message = result.data;

      // Destination chat room
      const room = `chat:${chatId}`;

      /*
       * Send the forwarded message
       * to everyone in destination chat.
       */
      io.to(room).emit("message:forwarded", {
        message,
      });

      /*
       * Confirm to the sender.
       */
      socket.emit("message:forward-success", {
        message,
      });

      console.log(
        `${socket.user.username} forwarded message ${messageId} to ${room}`,
      );
    } catch (error) {
      console.error("Message Forward Error:", error.message);

      socket.emit("message:forward:error", {
        message: error.message || "Failed to forward message.",
      });
    }
  });
  /**
   * ================================================
   * PIN MESSAGE
   * ================================================
   */

  socket.on("message:pin", async ({ messageId } = {}) => {
    try {
      if (!messageId) {
        socket.emit("message:pin:error", {
          message: "Message ID is required.",
        });

        return;
      }

      const result = await pinMessage(socket.user._id, messageId);

      const message = result.data;

      const room = `chat:${message.chat}`;

      /*
       * Notify everyone in the chat.
       */

      io.to(room).emit("message:pinned", {
        message,
      });

      /*
       * Confirm to sender.
       */

      socket.emit("message:pin-success", {
        message,
      });

      console.log(`${socket.user.username} pinned message ${messageId}`);
    } catch (error) {
      console.error("Message Pin Error:", error.message);

      socket.emit("message:pin:error", {
        message: error.message || "Failed to pin message.",
      });
    }
  });

  /**
   * ================================================
   * UNPIN MESSAGE
   * ================================================
   */

  socket.on("message:unpin", async ({ messageId } = {}) => {
    try {
      if (!messageId) {
        socket.emit("message:unpin:error", {
          message: "Message ID is required.",
        });

        return;
      }

      /*
       * Fetch message before unpinning
       * so we know its chat room.
       */

      const Message = (await import("../models/Message.js")).default;

      const message = await Message.findById(messageId).select("chat");

      if (!message) {
        socket.emit("message:unpin:error", {
          message: "Message not found.",
        });

        return;
      }

      const chatId = message.chat.toString();

      /*
       * Unpin message.
       */

      await unpinMessage(socket.user._id, messageId);

      const room = `chat:${chatId}`;

      /*
       * Notify everyone in chat.
       */

      io.to(room).emit("message:unpinned", {
        messageId,
      });

      /*
       * Confirm to sender.
       */

      socket.emit("message:unpin-success", {
        messageId,
      });

      console.log(`${socket.user.username} unpinned message ${messageId}`);
    } catch (error) {
      console.error("Message Unpin Error:", error.message);

      socket.emit("message:unpin:error", {
        message: error.message || "Failed to unpin message.",
      });
    }
  });
  /**
   * ================================================
   * MARK MESSAGE AS DELIVERED
   * ================================================
   */

  socket.on("message:mark-delivered", async ({ messageId } = {}) => {
    try {
      if (!messageId) return;

      const result = await markMessageAsDelivered(socket.user._id, messageId);
      if (result.data && result.data.chat) {
        const room = `chat:${result.data.chat._id || result.data.chat}`;
        // Tell everyone in chat that message status was updated
        io.to(room).emit("message:updated", {
          message: result.data,
        });
      }
    } catch (error) {
      console.error("Message Mark Delivered Error:", error.message);
    }
  });

  /**
   * ================================================
   * MARK CHAT MESSAGES AS READ
   * ================================================
   */

  socket.on("chat:mark-read", async ({ chatId } = {}) => {
    try {
      if (!chatId) return;

      const result = await markChatAsRead(socket.user._id, chatId);
      const room = `chat:${chatId}`;
      
      // Tell everyone in chat that messages were read by this user
      io.to(room).emit("chat:messages-read", {
        chatId: result.data.chatId,
        userId: result.data.userId,
      });
    } catch (error) {
      console.error("Chat Mark Read Error:", error.message);
    }
  });
};

export default registerMessageEvents;

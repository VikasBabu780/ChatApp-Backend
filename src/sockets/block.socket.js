import { blockUser, unblockUser } from "../services/block.service.js";

const registerBlockEvents = (io, socket) => {
  /**
   * ========================================================
   * BLOCK USER
   * ========================================================
   */

  socket.on("user:block", async ({ userId } = {}) => {
    try {
      if (!userId) {
        socket.emit("user:block:error", {
          message: "User ID is required.",
        });

        return;
      }

      const result = await blockUser(socket.user._id, userId);

      /*
       * Confirm to the user who
       * performed the block.
       */

      socket.emit("user:blocked", {
        userId,
      });

      /*
       * Notify the blocked user.
       *
       * Their personal room is:
       * user:<userId>
       */

      io.to(`user:${userId}`).emit("user:blocked-by", {
        userId: socket.user._id,
      });

      console.log(`${socket.user.username} blocked user ${userId}`);
    } catch (error) {
      console.error("Block User Socket Error:", error.message);

      socket.emit("user:block:error", {
        message: error.message || "Failed to block user.",
      });
    }
  });

  /**
   * ========================================================
   * UNBLOCK USER
   * ========================================================
   */

  socket.on("user:unblock", async ({ userId } = {}) => {
    try {
      if (!userId) {
        socket.emit("user:unblock:error", {
          message: "User ID is required.",
        });

        return;
      }

      await unblockUser(socket.user._id, userId);

      /*
       * Confirm to the user who
       * performed the unblock.
       */

      socket.emit("user:unblocked", {
        userId,
      });

      /*
       * Notify the other user.
       */

      io.to(`user:${userId}`).emit("user:unblocked-by", {
        userId: socket.user._id,
      });

      console.log(`${socket.user.username} unblocked user ${userId}`);
    } catch (error) {
      console.error("Unblock User Socket Error:", error.message);

      socket.emit("user:unblock:error", {
        message: error.message || "Failed to unblock user.",
      });
    }
  });
};

export default registerBlockEvents;

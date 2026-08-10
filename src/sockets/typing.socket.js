const registerTypingEvents = (io, socket) => {
  /**
   * ================================
   * USER STARTED TYPING
   * ================================
   */
  socket.on("typing:start", ({ chatId }) => {
    try {
      if (!chatId) {
        socket.emit("typing:error", {
          message: "Chat ID is required.",
        });

        return;
      }

      const room = `chat:${chatId}`;

      // Notify everyone except the sender
      socket.to(room).emit("typing:start", {
        chatId,
        user: {
          id: socket.user._id,
          publicId: socket.user.publicId,
          username: socket.user.username,
        },
      });
    } catch (error) {
      console.error(
        "Typing Start Error:",
        error.message
      );
    }
  });

  /**
   * ================================
   * USER STOPPED TYPING
   * ================================
   */
  socket.on("typing:stop", ({ chatId }) => {
    try {
      if (!chatId) {
        socket.emit("typing:error", {
          message: "Chat ID is required.",
        });

        return;
      }

      const room = `chat:${chatId}`;

      // Notify everyone except the sender
      socket.to(room).emit("typing:stop", {
        chatId,
        userId: socket.user._id,
      });
    } catch (error) {
      console.error(
        "Typing Stop Error:",
        error.message
      );
    }
  });
};

export default registerTypingEvents;
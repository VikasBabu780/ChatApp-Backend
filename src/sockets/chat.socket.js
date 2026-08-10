const registerChatEvents = (io, socket) => {
  /**
   * =====================================================
   * JOIN CHAT / GROUP ROOM
   * =====================================================
   */
  socket.on("chat:join", (chatId) => {
    try {
      if (!chatId) {
        socket.emit("chat:error", {
          message: "Chat ID is required.",
        });

        return;
      }

      const room = `chat:${chatId}`;

      socket.join(room);

      console.log(
        `${socket.user.username} joined ${room}`
      );

      socket.emit("chat:joined", {
        chatId,
        message: "Joined chat successfully.",
      });
    } catch (error) {
      console.error(
        "Chat Join Error:",
        error.message
      );

      socket.emit("chat:error", {
        message: "Failed to join chat.",
      });
    }
  });


  /**
   * =====================================================
   * LEAVE CHAT / GROUP ROOM
   * =====================================================
   */
  socket.on("chat:leave", (chatId) => {
    try {
      if (!chatId) {
        socket.emit("chat:error", {
          message: "Chat ID is required.",
        });

        return;
      }

      const room = `chat:${chatId}`;

      socket.leave(room);

      console.log(
        `${socket.user.username} left ${room}`
      );

      socket.emit("chat:left", {
        chatId,
        message: "Left chat successfully.",
      });
    } catch (error) {
      console.error(
        "Chat Leave Error:",
        error.message
      );

      socket.emit("chat:error", {
        message: "Failed to leave chat.",
      });
    }
  });


  /**
   * =====================================================
   * GROUP CREATED
   * =====================================================
   */
  socket.on(
    "group:created",
    ({ groupId }) => {
      try {
        if (!groupId) {
          socket.emit("group:error", {
            message: "Group ID is required.",
          });

          return;
        }

        console.log(
          `Group created: ${groupId}`
        );

        socket.emit("group:created", {
          groupId,
        });
      } catch (error) {
        console.error(
          "Group Created Error:",
          error.message
        );
      }
    }
  );


  /**
   * =====================================================
   * GROUP JOIN
   * =====================================================
   */
  socket.on(
    "group:join",
    ({ groupId }) => {
      try {
        if (!groupId) {
          socket.emit("group:error", {
            message: "Group ID is required.",
          });

          return;
        }

        const room = `chat:${groupId}`;

        socket.join(room);

        socket.emit("group:joined", {
          groupId,
          message: "Joined group successfully.",
        });

        socket.to(room).emit(
          "group:member:online",
          {
            groupId,
            user: {
              id: socket.user._id,
              publicId:
                socket.user.publicId,
              username:
                socket.user.username,
            },
          }
        );
      } catch (error) {
        console.error(
          "Group Join Error:",
          error.message
        );
      }
    }
  );


  /**
   * =====================================================
   * GROUP LEAVE
   * =====================================================
   */
  socket.on(
    "group:leave",
    ({ groupId }) => {
      try {
        if (!groupId) {
          socket.emit("group:error", {
            message: "Group ID is required.",
          });

          return;
        }

        const room = `chat:${groupId}`;

        socket.leave(room);

        socket.emit("group:left", {
          groupId,
          message: "Left group successfully.",
        });

        socket.to(room).emit(
          "group:member:left",
          {
            groupId,
            userId: socket.user._id,
          }
        );
      } catch (error) {
        console.error(
          "Group Leave Error:",
          error.message
        );
      }
    }
  );


  /**
   * =====================================================
   * GROUP MEMBER ADDED
   * =====================================================
   */
  socket.on(
    "group:member:added",
    ({ groupId, member }) => {
      try {
        if (!groupId || !member) {
          socket.emit("group:error", {
            message:
              "Group ID and member are required.",
          });

          return;
        }

        const room = `chat:${groupId}`;

        io.to(room).emit(
          "group:member:added",
          {
            groupId,
            member,
          }
        );
      } catch (error) {
        console.error(
          "Group Member Added Error:",
          error.message
        );
      }
    }
  );


  /**
   * =====================================================
   * GROUP MEMBER REMOVED
   * =====================================================
   */
  socket.on(
    "group:member:removed",
    ({ groupId, memberId }) => {
      try {
        if (!groupId || !memberId) {
          socket.emit("group:error", {
            message:
              "Group ID and member ID are required.",
          });

          return;
        }

        const room = `chat:${groupId}`;

        io.to(room).emit(
          "group:member:removed",
          {
            groupId,
            memberId,
          }
        );
      } catch (error) {
        console.error(
          "Group Member Removed Error:",
          error.message
        );
      }
    }
  );


  /**
   * =====================================================
   * GROUP UPDATED
   * =====================================================
   */
  socket.on(
    "group:updated",
    ({ groupId, group }) => {
      try {
        if (!groupId) {
          socket.emit("group:error", {
            message: "Group ID is required.",
          });

          return;
        }

        const room = `chat:${groupId}`;

        io.to(room).emit(
          "group:updated",
          {
            groupId,
            group,
          }
        );
      } catch (error) {
        console.error(
          "Group Updated Error:",
          error.message
        );
      }
    }
  );
};

export default registerChatEvents;
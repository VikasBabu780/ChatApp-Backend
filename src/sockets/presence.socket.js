import {
  markUserOnline,
  markUserOffline,
} from "../services/presence.service.js";

const registerPresenceEvents = async (io, socket) => {
  const user = socket.user;

  try {
    // Mark user online
    await markUserOnline(user._id);

    // Join personal room
    const personalRoom = `user:${user._id}`;
    socket.join(personalRoom);

    // Notify others
    socket.broadcast.emit("presence:update", {
      userId: user._id,
      isOnline: true,
    });

    console.log(`${user.username} is online`);
  } catch (error) {
    console.error("Presence Online Error:", error.message);
  }

  // Handle disconnect
  socket.on("disconnect", async () => {
    try {
      const lastSeen = await markUserOffline(user._id);

      socket.broadcast.emit("presence:update", {
        userId: user._id,
        isOnline: false,
        lastSeen,
      });

      console.log(`${user.username} is offline`);
    } catch (error) {
      console.error("Presence Offline Error:", error.message);
    }
  });
};

export default registerPresenceEvents;
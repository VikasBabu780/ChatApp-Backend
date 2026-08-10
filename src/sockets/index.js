import { Server } from "socket.io";
import socketAuth from "./socketAuth.js";
import registerSocketEvents from "./socketEvents.js";

let io = null;

/**
 * Initialize Socket.IO
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authenticate every socket connection
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(
      `Socket Connected: ${socket.user.username} (${socket.id})`
    );

    registerSocketEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(
        `Socket Disconnected: ${socket.user.username} (${socket.id})`
      );
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export default initializeSocket;
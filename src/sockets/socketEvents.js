import registerChatEvents from "./chat.socket.js";
import registerMessageEvents from "./message.socket.js";
import registerPresenceEvents from "./presence.socket.js";
import registerTypingEvents from "./typing.socket.js";
import registerBlockEvents from "./block.socket.js";

const registerSocketEvents = (io, socket) => {

  console.log(
    `Registering events for ${socket.id}`
  );

  registerPresenceEvents(io, socket);

  registerChatEvents(io, socket);

  registerMessageEvents(io, socket);

  registerTypingEvents(io, socket);

  registerBlockEvents(io, socket);

};

export default registerSocketEvents;
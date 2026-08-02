const { v4: uuidv4 } = require("uuid");

function relayToPartner(io, state, socketId, event, payload) {
  const user = state.users.get(socketId);
  if (!user?.partnerId) return;

  io.to(user.partnerId).emit(event, payload);
}

module.exports = function registerChat(io, socket, state) {
  socket.on("send-message", ({ text }) => {
    const user = state.users.get(socket.id);
    if (!user?.partnerId || !text?.trim()) return;

    const message = {
      id: uuidv4(),
      text: text.trim(),
      timestamp: Date.now(),
      sender: "stranger",
    };

    relayToPartner(io, state, socket.id, "receive-message", message);

    socket.emit("message-sent", {
      ...message,
      sender: "you",
    });
  });

  socket.on("typing", ({ isTyping }) => {
    relayToPartner(io, state, socket.id, "partner-typing", { isTyping: !!isTyping });
  });
};

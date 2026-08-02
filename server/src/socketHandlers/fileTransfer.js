const { v4: uuidv4 } = require("uuid");
const { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } = require("../config/constants");

function relayToPartner(io, state, socketId, event, payload) {
  const user = state.users.get(socketId);
  if (!user?.partnerId) return;

  io.to(user.partnerId).emit(event, payload);
}

module.exports = function registerFileTransfer(io, socket, state) {
  socket.on("send-file", ({ name, mimeType, size, data }) => {
    const user = state.users.get(socket.id);
    if (!user?.partnerId) return;

    if (!name || !mimeType || !data) {
      socket.emit("file-error", { message: "Invalid file payload" });
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      socket.emit("file-error", {
        message: "Only images (jpg, png, gif, webp) and PDF files are allowed",
      });
      return;
    }

    if (size > MAX_FILE_SIZE) {
      socket.emit("file-error", { message: "File size must be 5MB or less" });
      return;
    }

    const fileMessage = {
      id: uuidv4(),
      type: "file",
      name,
      mimeType,
      size,
      data,
      timestamp: Date.now(),
      sender: "stranger",
    };

    relayToPartner(io, state, socket.id, "receive-file", fileMessage);

    socket.emit("file-sent", {
      ...fileMessage,
      sender: "you",
    });
  });
};

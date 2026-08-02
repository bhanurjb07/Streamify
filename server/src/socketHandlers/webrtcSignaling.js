function relayToPartner(io, state, socketId, event, payload) {
  const user = state.users.get(socketId);
  if (!user?.partnerId) return;

  io.to(user.partnerId).emit(event, payload);
}

module.exports = function registerWebRTCSignaling(io, socket, state) {
  socket.on("call-start", ({ callType }) => {
    relayToPartner(io, state, socket.id, "incoming-call", {
      callType,
      from: socket.id,
    });
  });

  socket.on("call-accept", ({ callType }) => {
    relayToPartner(io, state, socket.id, "call-accepted", { callType });
  });

  socket.on("call-reject", () => {
    relayToPartner(io, state, socket.id, "call-rejected", {});
  });

  socket.on("call-end", () => {
    relayToPartner(io, state, socket.id, "call-ended", {});
  });

  socket.on("webrtc-offer", ({ offer }) => {
    relayToPartner(io, state, socket.id, "webrtc-offer", { offer });
  });

  socket.on("webrtc-answer", ({ answer }) => {
    relayToPartner(io, state, socket.id, "webrtc-answer", { answer });
  });

  socket.on("webrtc-ice-candidate", ({ candidate }) => {
    relayToPartner(io, state, socket.id, "webrtc-ice-candidate", { candidate });
  });
};

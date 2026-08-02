const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/loggers");

function removeFromQueue(state, socketId) {
  state.waitingQueue = state.waitingQueue.filter((id) => id !== socketId);
}

function getPartnerSocketId(state, socketId) {
  const user = state.users.get(socketId);
  if (!user?.partnerId) return null;
  return user.partnerId;
}

function notifyPartner(io, state, socketId, event, payload) {
  const partnerId = getPartnerSocketId(state, socketId);
  if (partnerId) {
    io.to(partnerId).emit(event, payload);
  }
}

function cleanupRoom(state, roomId) {
  if (roomId) {
    state.rooms.delete(roomId);
  }
}

function unpairUser(state, socketId) {
  const user = state.users.get(socketId);
  if (!user) return null;

  const partnerId = user.partnerId;
  const roomId = user.roomId;

  user.partnerId = null;
  user.roomId = null;
  user.status = "idle";

  if (partnerId) {
    const partner = state.users.get(partnerId);
    if (partner) {
      partner.partnerId = null;
      partner.roomId = null;
      partner.status = "idle";
    }
  }

  cleanupRoom(state, roomId);
  return partnerId;
}

function pairUsers(io, state, socketIdA, socketIdB) {
  const userA = state.users.get(socketIdA);
  const userB = state.users.get(socketIdB);

  if (!userA || !userB || socketIdA === socketIdB) return false;

  const roomId = uuidv4();

  userA.partnerId = socketIdB;
  userA.roomId = roomId;
  userA.status = "matched";

  userB.partnerId = socketIdA;
  userB.roomId = roomId;
  userB.status = "matched";

  state.rooms.set(roomId, { users: [socketIdA, socketIdB] });

  io.to(socketIdA).emit("matched", {
    roomId,
    partner: { name: userB.name, gender: userB.gender },
  });

  io.to(socketIdB).emit("matched", {
    roomId,
    partner: { name: userA.name, gender: userA.gender },
  });

  logger.success("Users matched", {
    roomId,
    users: [
      { socketId: socketIdA, name: userA.name },
      { socketId: socketIdB, name: userB.name },
    ],
  });

  return true;
}

function addToQueue(io, state, socketId) {
  const user = state.users.get(socketId);
  if (!user) return;

  removeFromQueue(state, socketId);
  unpairUser(state, socketId);

  if (state.waitingQueue.length > 0) {
    const partnerId = state.waitingQueue.shift();
    if (partnerId === socketId) {
      state.waitingQueue.push(socketId);
      user.status = "waiting";
      io.to(socketId).emit("waiting");
      return;
    }

    const partner = state.users.get(partnerId);
    if (!partner || partner.status !== "waiting") {
      state.waitingQueue.push(socketId);
      user.status = "waiting";
      io.to(socketId).emit("waiting");
      return;
    }

    pairUsers(io, state, socketId, partnerId);
    return;
  }

  state.waitingQueue.push(socketId);
  user.status = "waiting";
  io.to(socketId).emit("waiting");
}

function handleDisconnect(io, state, socketId) {
  removeFromQueue(state, socketId);

  const partnerId = unpairUser(state, socketId);

  if (partnerId) {
    io.to(partnerId).emit("partner-disconnected", {
      message: "Stranger has disconnected",
    });
    addToQueue(io, state, partnerId);
  }

  state.users.delete(socketId);
}

module.exports = function registerMatchmaking(io, socket, state) {
  socket.on("join", ({ name, gender }) => {
    if (!name?.trim() || !gender) {
      logger.warn("Join rejected: missing name or gender", { socketId: socket.id });
      socket.emit("error", { message: "Name and gender are required" });
      return;
    }

    logger.success("User joined queue", {
      socketId: socket.id,
      name: name.trim(),
      gender,
    });

    state.users.set(socket.id, {
      socketId: socket.id,
      name: name.trim(),
      gender,
      partnerId: null,
      roomId: null,
      status: "idle",
    });

    socket.emit("connected");
    addToQueue(io, state, socket.id);
  });

  socket.on("find-next", () => {
    const user = state.users.get(socket.id);
    if (!user) return;

    logger.info("User skipped partner", { socketId: socket.id, name: user.name });

    const partnerId = user.partnerId;
    if (partnerId) {
      notifyPartner(io, state, socket.id, "partner-skipped", {
        message: "Stranger skipped. Looking for someone new...",
      });
      unpairUser(state, socket.id);
      addToQueue(io, state, partnerId);
    }

    addToQueue(io, state, socket.id);
  });

  socket.on("disconnect-chat", () => {
    const user = state.users.get(socket.id);
    logger.info("User left chat", { socketId: socket.id, name: user?.name });

    const partnerId = unpairUser(state, socket.id);
    removeFromQueue(state, socket.id);

    if (partnerId) {
      notifyPartner(io, state, socket.id, "partner-disconnected", {
        message: "Stranger has disconnected",
      });
      addToQueue(io, state, partnerId);
    }

    const activeUser = state.users.get(socket.id);
    if (activeUser) {
      activeUser.status = "idle";
    }

    socket.emit("disconnected");
  });

  socket.on("disconnect", () => {
    const user = state.users.get(socket.id);
    logger.info("Client disconnected", { socketId: socket.id, name: user?.name });
    handleDisconnect(io, state, socket.id);
  });
};

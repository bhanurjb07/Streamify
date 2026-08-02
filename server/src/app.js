const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { CLIENT_URL } = require("./config/constants");
const registerMatchmaking = require("./socketHandlers/matchmaking");
const registerChat = require("./socketHandlers/chat");
const registerFileTransfer = require("./socketHandlers/fileTransfer");
const registerWebRTCSignaling = require("./socketHandlers/webrtcSignaling");

function createApp() {
  const app = express();
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  return app;
}

function createServer() {
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const state = {
    waitingQueue: [],
    users: new Map(),
    rooms: new Map(),
  };

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    registerMatchmaking(io, socket, state);
    registerChat(io, socket, state);
    registerFileTransfer(io, socket, state);
    registerWebRTCSignaling(io, socket, state);
  });

  return server;
}

module.exports = { createApp, createServer };

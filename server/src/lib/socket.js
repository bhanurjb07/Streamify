import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { env } from "../config/env.js";
import { corsOptions } from "../config/cors.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { getConversationId } from "./conversation.js";
import logger from "../utils/logger.js";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.jwt;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.user.fullName}`);

    socket.join(socket.user._id.toString());

    socket.on("join_conversation", ({ recipientId }) => {
      const roomId = getConversationId(socket.user._id, recipientId);
      socket.join(roomId);
    });

    socket.on("send_message", async ({ recipientId, text }) => {
      if (!recipientId || !text?.trim()) return;

      try {
        const message = await Message.create({
          sender: socket.user._id,
          recipient: recipientId,
          text: text.trim(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "fullName profilePic"
        );

        const roomId = getConversationId(socket.user._id, recipientId);
        io.to(roomId).emit("new_message", populatedMessage);
      } catch (error) {
        logger.error("Error sending message", { message: error.message });
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.user.fullName}`);
    });
  });

  return io;
}

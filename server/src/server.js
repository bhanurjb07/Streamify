import http from "http";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./lib/socket.js";
import logger from "./utils/logger.js";

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${env.port} is already in use. Stop the other server and try again.`);
  } else {
    logger.error("Server failed to start", { message: error.message });
  }
  process.exit(1);
});

httpServer.listen(env.port, () => {
  logger.success(`Server is running on port ${env.port}`);
  connectDB();
});

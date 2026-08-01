import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUrl);
    logger.success(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB error", { message: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (err) {
    logger.error("Error connecting to DB", { message: err.message });
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

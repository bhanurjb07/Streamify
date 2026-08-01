import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URL", "JWT_SECRET_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is missing in .env`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
};

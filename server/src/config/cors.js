import { env } from "./env.js";

const DEV_ORIGIN_PATTERN = /^http:\/\/localhost:\d+$/;

export function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (env.nodeEnv === "production") {
    return origin === process.env.CLIENT_URL;
  }

  return DEV_ORIGIN_PATTERN.test(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

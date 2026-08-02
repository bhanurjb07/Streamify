require("dotenv").config();

const PORT = Number(process.env.PORT);
const CLIENT_URL = process.env.CLIENT_URL;

if (!PORT) {
  throw new Error("PORT is required in server/.env");
}

if (!CLIENT_URL) {
  throw new Error("CLIENT_URL is required in server/.env");
}

module.exports = {
  PORT,
  CLIENT_URL,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ]),
};

module.exports = {
  PORT: 5000,
  CLIENT_URL: "http://localhost:3000",
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ]),
};

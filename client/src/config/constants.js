const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
const STUN_URL = import.meta.env.VITE_STUN_URL;

if (!SERVER_URL) {
  throw new Error("VITE_BACKEND_URL is required in client/.env");
}

if (!STUN_URL) {
  throw new Error("VITE_STUN_URL is required in client/.env");
}

export { SERVER_URL };

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export const ICE_SERVERS = {
  iceServers: [{ urls: STUN_URL }],
};

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const port = Number(env.VITE_PORT);
  if (!port) {
    throw new Error("VITE_PORT is required in client/.env");
  }

  return {
    plugins: [react()],
    server: { port },
  };
});

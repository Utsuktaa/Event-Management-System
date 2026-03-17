import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const NGROK_HOST =
  "d6ca-2400-1a00-3b2e-54fc-9c00-9c90-e3d6-c230.ngrok-free.app";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // allows network access
    port: 5173, // your dev port
    strictPort: true,
    allowedHosts: [".ngrok-free.app"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

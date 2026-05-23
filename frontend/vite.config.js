import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const NGROK_HOST =
  "1d5d-2400-1a00-3b23-66e0-7dac-3bb4-6d97-b1c3.ngrok-free.app";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // allows network access
    port: 5173, 
    strictPort: true,
    allowedHosts: [".ngrok-free.app"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

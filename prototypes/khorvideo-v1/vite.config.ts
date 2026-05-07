import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  // to make use of `TAURI_DEV_HOST` if available
  envPrefix: ["VITE_", "TAURI_"],
});
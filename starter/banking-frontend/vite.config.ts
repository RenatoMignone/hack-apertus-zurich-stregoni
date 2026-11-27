import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Port 8090 for dev and Docker, so it doesn't collide with the teams' own dev servers (3000, 5173).
export default defineConfig({
  plugins: [react()],
  server: { port: 8090, strictPort: true },
  preview: { port: 8090, strictPort: true },
});

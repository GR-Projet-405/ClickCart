import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: "/provider/dashboard",
  },
});


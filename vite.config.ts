import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  server: {
    open: true,
    port: 5173,
    // Staff tool API runs in `wrangler pages dev` (pnpm staff:api) on :8788
    // with a local D1 database; same-origin from the browser's point of view
    // so the HttpOnly session cookie just works.
    proxy: {
      "/staff-api": { target: "http://localhost:8788", changeOrigin: false },
    },
  },
  // vite-react-ssg: only pre-render the public marketing pages.
  // Admin + checkout-success are client-only app routes.
  ssgOptions: {
    includedRoutes(paths: string[]) {
      return paths.filter(
        (path) => !path.startsWith("/admin") && path !== "/success",
      );
    },
  },
});

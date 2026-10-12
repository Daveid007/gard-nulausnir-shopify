import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const directory = path.dirname(fileURLToPath(import.meta.url));
const storefront = path.resolve(directory, "../..");

// This is a test-only entry, not a storefront route or production build input.
export default defineConfig({
  root: directory,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(storefront, "src") },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 4179,
    strictPort: true,
    fs: { allow: [searchForWorkspaceRoot(storefront)] },
  },
});

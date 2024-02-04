import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

installGlobals();

export default defineConfig({
  plugins: [remix()],
  server: {
    port: 3000,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
});
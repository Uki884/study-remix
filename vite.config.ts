import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import path from "path";
import { defineConfig } from "vite";
import remixConfig from './remix.config'

installGlobals();

export default defineConfig({
  plugins: [remix(remixConfig)],
  build: {
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15']
  },
  server: {
    port: 3000,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
  resolve: {                               
    alias: {                               
      '@': path.resolve(__dirname, './app')
    }                                      
  }
});
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  legacy: {
    collectionsBackwardsCompat: true,
  },
  adapter: cloudflare({
    imageService: "cloudflare-binding",
  }),
  platformProxy: {
    enabled: true,
  },
  vite: {
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
      cssCodeSplit: true,
      rollupOptions: {},
    },
    server: {
      proxy: {
        "/__eventitech_proxy": {
          target: "https://api.eventitech.it",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__eventitech_proxy/, ""),
        },
      },
    },
  },
});

import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "cloudflare",
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
      rollupOptions: {
        output: {
          manualChunks: {
            'gsap': ['gsap'],
            'vendor': ['jquery', 'bootstrap'],
          },
        },
      },
    },
  },
});

import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import * as dotenv from "dotenv";

dotenv.config();

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
});
